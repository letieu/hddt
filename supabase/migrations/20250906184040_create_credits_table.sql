create table if not exists public.credits (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid,
    credit_count integer NOT NULL DEFAULT 0,
    CONSTRAINT credits_pkey PRIMARY KEY (id),
    CONSTRAINT credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);
