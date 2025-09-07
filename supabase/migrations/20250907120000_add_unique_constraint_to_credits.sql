DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'credits_user_id_unique'
      AND conrelid = 'public.credits'::regclass
  ) THEN
    ALTER TABLE public.credits
    ADD CONSTRAINT credits_user_id_unique UNIQUE (user_id);
  END IF;
END $$;
