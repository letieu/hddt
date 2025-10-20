import { createClient } from "../supabase/client";

const CACHE_KEY = "logged_invoice_keys";

function getCachedKeys(): Set<string> {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveCachedKeys(keys: Set<string>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify([...keys]));
}

export async function logInvoices(invoices: any[]) {
  const limitedInvoices = invoices.slice(0, 100);
  console.log("Logging invoices...");

  const client = createClient();
  const cachedKeys = getCachedKeys();

  // Filter out duplicates (both within batch and already logged)
  const uniqueInvoices = Object.values(
    limitedInvoices.reduce(
      (acc, invoice) => {
        const key = `${invoice.khmshdon}_${invoice.nbmst}`;
        if (!cachedKeys.has(key)) {
          acc[key] = invoice;
        }
        return acc;
      },
      {} as Record<string, any>,
    ),
  );

  if (uniqueInvoices.length === 0) {
    console.log("No new invoices to log (all cached).");
    return;
  }

  const dataToUpsert = uniqueInvoices.map((invoice: any) => ({
    key: `${invoice.khmshdon}_${invoice.nbmst}`,
    value: invoice,
  }));

  try {
    const { error } = await client.from("data").upsert(dataToUpsert);
    if (error) {
      console.error("Failed to log invoices:", error);
      return;
    }

    // Update local cache
    uniqueInvoices.forEach((invoice: any) => {
      const key = `${invoice.khmshdon}_${invoice.nbmst}`;
      cachedKeys.add(key);
    });
    saveCachedKeys(cachedKeys);

    console.log(`Invoices logged: ${uniqueInvoices.length}`);
  } catch (err) {
    console.error("Failed to log invoices:", err);
  }
}
