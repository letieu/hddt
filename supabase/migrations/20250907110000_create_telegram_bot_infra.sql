-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions for pg_net
GRANT USAGE ON SCHEMA net TO postgres;

-- Create function to increment credit
CREATE OR REPLACE FUNCTION increment_credit (user_id_input uuid, increment_value int)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO credits (user_id, credit_count)
  VALUES (user_id_input, increment_value)
  ON CONFLICT (user_id)
  DO UPDATE SET credit_count = credits.credit_count + increment_value;
END;
$$;

-- Create a trigger function to send a notification on new payment
CREATE OR REPLACE FUNCTION on_new_payment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://mtnodjzbbmrmmsylhixj.supabase.co/functions/v1/notify-admin-telegram',
    body := jsonb_build_object('record', row_to_json(NEW)),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$;

-- Create the trigger on the payment_notifications table
DROP TRIGGER IF EXISTS on_new_payment_notification_trigger ON public.payment_notifications;

CREATE TRIGGER on_new_payment_notification_trigger
  AFTER INSERT ON public.payment_notifications
  FOR EACH ROW
  EXECUTE FUNCTION on_new_payment_notification();
