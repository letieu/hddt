import { getDownloadProvider } from "./downloader";
import { getProviderDetail } from "./hoadongoc-provider-list";
import { Invoice, InvoiceWithProvider } from "./types";

export function detectProvider(invoices: Invoice[]): InvoiceWithProvider[] {
  return invoices.map((invoice) => {
    const provider = getProviderDetail(invoice);
    const downloadProvider = getDownloadProvider(invoice);
    return {
      ...invoice,
      providerInfo: provider,
      providerLookupInfo: downloadProvider?.lookupInfo(invoice),
      providerLookupUrl:
        downloadProvider?.lookupUrl(invoice) || provider?.lookup,
      providerError: provider
        ? undefined
        : "Không tìm thấy nhà cung cấp hóa đơn điện tử",
    };
  });
}
