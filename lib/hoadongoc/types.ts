import { InvoiceQueryType } from "@/lib/download/hoadon-api";
import { ProviderInfo } from "./hoadongoc-provider-list";

export type Invoice = {
  khhdon: string; // Khẩu hợp đồng
  shdon: string; // Số hóa đơn
  tdlap: string; // Ngày lập
  nbten: string; // Tên người bán
  tgtcthue: number; // Tổng tiền chưa thuê

  msttcgp: string; // MST cung cấp DV (Provider)
  nbmst: string; // MST người bán
  id: string; // ID
  ttkhac: {
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

export type InvoiceWithProvider = Invoice & {
  providerInfo: ProviderInfo | null;
  providerError?: string;
  providerLookupInfo?: string;
  providerLookupUrl?: string;
};

export type LogEntry = {
  status: "info" | "success" | "failed";
  message: string;
};

export const queryTypeNames: { [key in InvoiceQueryType]: string } = {
  query: "Hóa đơn điện tử",
  "sco-query": "Hóa đơn có mã từ máy tính tiền",
};

export const mockInvoice: InvoiceWithProvider = {
  id: "mock-id",
  khhdon: "C25TAA",
  shdon: "0000001",
  tdlap: "2025-10-16",
  nbten: "CÔNG TY TNHH GIẢI PHÁP ABC",
  nbmst: "0313131313",
  tgtcthue: 1000000,
  msttcgp: "0101010101",
  ttkhac: [],
  cttkhac: [],
  providerInfo: {
    name: "Nhà cung cấp XYZ",
    MST: "0101010101",
    lookup: "https://example.com/lookup",
    homePage: "",
  },
  providerLookupInfo: "Mã tra cứu: MOCKCODE",
  providerLookupUrl: "https://example.com/lookup?code=MOCKCODE",
};
