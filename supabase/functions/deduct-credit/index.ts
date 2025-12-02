import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { creditAmount } = await req.json(); // Get creditAmount from body

    if (typeof creditAmount !== "number" || creditAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid creditAmount provided." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error or no user:", userError?.message);
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = user.id;
    const { data: creditsData, error: fetchError } = await supabaseClient
      .from("credits")
      .select("credit_count")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching credits:", fetchError.message);
      throw fetchError;
    }

    const currentCredit = creditsData?.credit_count || 0;
    console.log("Current Credit Count:", currentCredit);

    // Check if user has enough credits before deducting
    if (currentCredit < creditAmount) {
      console.warn(
        "Not enough credits for user:",
        userId,
        "Current:",
        currentCredit,
        "Required:",
        creditAmount,
      );
      return new Response(JSON.stringify({ error: "Not enough credits" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const newCreditCount = currentCredit - creditAmount; // Deduct the specified amount
    console.log(
      "Attempting to deduct credit. New count will be:",
      newCreditCount,
    );

    console.log("Updating credits table...");
    console.log(`User ID: _${userId}_`);
    const { data: updateData, error: updateError } = await supabaseClient
      .from("credits")
      .update({ credit_count: newCreditCount })
      .eq("user_id", userId)
      .select(); // Add .select() to get the updated row data

    if (updateError) {
      console.error("Error updating credits:", updateError.message);
      throw updateError;
    }

    console.log("Update operation successful. Updated data:", updateData);

    return new Response(
      JSON.stringify({
        message: "Credit deducted successfully",
        new_credit_count: newCreditCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Catch block error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
