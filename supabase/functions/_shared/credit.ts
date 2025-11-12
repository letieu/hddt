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
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("[ERROR] Fetching profile:", profileError);
    throw new Error(profileError.message);
  }
  if (!profile) throw new CreditError("User profile not found.");
  if (profile.credits < amount) {
    throw new CreditError(
      `Not enough credits. Need ${amount}, but have ${profile.credits}.`,
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ credits: profile.credits - amount })
    .eq("id", userId);

  if (updateError) {
    console.error("[ERROR] Updating credits:", updateError);
    throw new Error(updateError.message);
  }
}
