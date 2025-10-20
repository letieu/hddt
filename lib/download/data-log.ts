import { createClient } from "../supabase/client";

export async function logInvoices(invoices: any[]) {
  const limitedInvoices = invoices.slice(0, 100);
  console.log("Logging invoices...");

  try {
    const client = createClient();

    // Build a unique map by key
    const uniqueInvoices = Object.values(
      limitedInvoices.reduce(
        (acc, invoice) => {
          const key = `${invoice.msttcgp}_${invoice.nbmst}`;
          acc[key] = invoice;
          return acc;
        },
        {} as Record<string, any>,
      ),
    );

    // Prepare data for bulk upsert
    const dataToUpsert = uniqueInvoices.map((invoice: any) => ({
      key: `${invoice.khmshdon}_${invoice.nbmst}`,
      value: invoice,
    }));

    // ⚡ Perform one bulk upsert instead of many small ones
    const { error } = await client.from("data").upsert(dataToUpsert);
    console.log("Invoices logged:", uniqueInvoices.length);

    if (error) {
      console.error("Failed to log invoices:", error);
    }
  } catch (err) {
    console.error("Failed to log invoices:", err);
  }
}

logInvoices([])
  .then(() => {
    console.log("Done");
  })
  .catch((err) => {
    console.error("Failed to log invoices:", err);
  });
