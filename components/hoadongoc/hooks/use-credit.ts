import { FunctionsHttpError } from "@supabase/supabase-js";

export function useCredit(supabase: any) {
  const checkCredit = async (creditsToDeduct: number) => {
    const { error } = await supabase.functions.invoke("check-credit", {
      body: { creditAmount: creditsToDeduct },
    });

    if (!error) return;

    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      const res = await error.context.json();
      message = res?.error ?? error.message;
    }
    return message;
  };

  const deductCredit = async (creditsToDeduct: number) => {
    const { data, error } = await supabase.functions.invoke("deduct-credit", {
      body: { creditAmount: creditsToDeduct },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    window.dispatchEvent(new Event("credit-update"));
  };

  return { checkCredit, deductCredit };
}
