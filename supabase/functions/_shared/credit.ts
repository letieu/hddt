import { createClient } from "npm:@supabase/supabase-js@2";

export class CreditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreditError";
  }
}

export async function deductCredits(
  supabaseAdmin: any,
  userId: string,
  amount: number,
) {
  const { data: creditsData, error: fetchError } = await supabaseAdmin
    .from("credits")
    .select("credit_count")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") { // PGRST116: row not found
    console.error("[ERROR] Fetching credits:", fetchError);
    throw new Error(fetchError.message);
  }

  const currentCredit = creditsData?.credit_count || 0;

  if (currentCredit < amount) {
    throw new CreditError(
      `Not enough credits. Need ${amount}, but have ${currentCredit}.`,
    );
  }

  const newCreditCount = currentCredit - amount;

  const { error: updateError } = await supabaseAdmin
    .from("credits")
    .update({ credit_count: newCreditCount })
    .eq("user_id", userId);

  if (updateError) {
    console.error("[ERROR] Updating credits:", updateError);
    throw new Error(updateError.message);
  }
}
