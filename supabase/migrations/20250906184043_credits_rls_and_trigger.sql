-- Enable RLS if not already enabled
alter table credits enable row level security;

-- Drop old policy if it exists (safe to run multiple times)
drop policy if exists "update_own_credits" on credits;

-- Create policy: allow user to update only their own row
create policy "update_own_credits"
on credits
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create or replace trigger function to prevent credit increase
create or replace function prevent_credit_increase()
returns trigger as $$
declare
  jwt json;
  user_role text;
begin
  -- Read JWT claims if available
  begin
    jwt := current_setting('request.jwt.claims', true)::json;
    user_role := jwt->>'role';
  exception when others then
    -- No JWT means admin console or service context → allow
    user_role := 'service_role';
  end;

  -- Block credit increase unless service role
  if user_role != 'service_role' and NEW.credit_count > OLD.credit_count then
    raise exception 'Cannot increase credit_count via update';
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Drop old trigger if it exists
drop trigger if exists prevent_credit_increase_trigger on credits;

-- Attach trigger to table
create trigger prevent_credit_increase_trigger
before update on credits
for each row
execute function prevent_credit_increase();
