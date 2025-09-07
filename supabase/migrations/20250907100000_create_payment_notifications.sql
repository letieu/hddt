create table if not exists public.payment_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid,
    user_email text,
    credit_option_id text,
    credit_option_name text,
    credit_amount integer,
    price integer,
    payment_info text,
    status text NOT NULL DEFAULT 'pending'::text,
    CONSTRAINT payment_notifications_pkey PRIMARY KEY (id),
    CONSTRAINT payment_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

drop policy if exists "Allow authenticated users to insert their own notifications" on public.payment_notifications;
CREATE POLICY "Allow authenticated users to insert their own notifications"
ON public.payment_notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

drop policy if exists "Enable read access for admins" on public.payment_notifications;
CREATE POLICY "Enable read access for admins"
ON public.payment_notifications
FOR SELECT
TO service_role
USING (true);
