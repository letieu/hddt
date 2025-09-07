import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { selectedOption, user } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payment_info = `NAP CREDIT ${selectedOption.id.toUpperCase()} ${user.id.substring(0, 4)}${user.id.substring(user.id.length - 4)}`;

    const { error } = await supabaseAdmin.from("payment_notifications").insert({
      user_id: user.id,
      user_email: user.email,
      credit_option_id: selectedOption.id,
      credit_option_name: selectedOption.name,
      credit_amount: selectedOption.credits,
      price: selectedOption.price,
      payment_info: payment_info,
      status: "pending",
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: "Notification sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
