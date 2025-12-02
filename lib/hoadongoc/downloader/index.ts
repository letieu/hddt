import { FallbackProvider } from "./fallback-provider";
import { FastProvider } from "./fast-provider";
import { GioathongProvider } from "./giaothongso-provider";
import { MInvoiceProvider } from "./m-invoice-provider";
import { MeinvoiceProvider } from "./meinvoice-provider";
import { PetrolimexProvider } from "./petrolimex-provider";

export type DownloadParams = {
  khhdon: string; // Ký hiệu
  shdon: string; // Số hóa đơn
  msttcgp: string; // MST cung cấp DV (Provider)
  nbmst: string; // MST người bán
  id: string; // ID
  ttkhac: {
    // Thông tin khác
    ttruong: string;
    kdlieu: string;
    dlieu: string;
  }[];
  cttkhac: {
    ttruong: string;
    kdlieu: string;
    dlieu: string;
  }[];
  nbcks: string;
};

export interface HoadongocDownloadProvider {
  name: string;
  detectProvider(params: DownloadParams): boolean;
  lookupUrl(params: DownloadParams): string;
  lookupInfo(params: DownloadParams): string;
  download(params: DownloadParams): Promise<ArrayBuffer>;
}

const downloadProviders: HoadongocDownloadProvider[] = [
  // Người bán
  new GioathongProvider(),
  new PetrolimexProvider(),
  // Nhà cung cấp
  new MeinvoiceProvider(),
  new MInvoiceProvider(),
  new FastProvider(),
];

const allProviders: HoadongocDownloadProvider[] = [
  ...downloadProviders,
  new FallbackProvider(),
];

export function getLookupProvider(params: DownloadParams) {
  return allProviders.find((p) => p.detectProvider(params));
}

export function getDownloadProvider(params: DownloadParams) {
  return downloadProviders.find((p) => p.detectProvider(params));
}

export function downloadPdf(params: DownloadParams) {
  const downloadProvider = getDownloadProvider(params);
  if (!downloadProvider) {
    throw new Error("No provider found for " + params.id);
  }

  return downloadProvider.download(params);
}
