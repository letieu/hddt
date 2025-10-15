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
};

interface HoadongocDownloadProvider {
  name: string;
  detectProvider(params: DownloadParams): boolean;
  lookupUrl(params: DownloadParams): string;
  lookupInfo(params: DownloadParams): string;
  download(params: DownloadParams): Promise<ArrayBuffer>;
}

// meinvoice (Misa)
class MeinvoiceProvider implements HoadongocDownloadProvider {
  name = "Meinvoice";

  detectProvider(params: DownloadParams): boolean {
    return params.msttcgp === "0101243150";
  }

  lookupUrl(params: DownloadParams) {
    return "https://www.meinvoice.vn/tra-cuu/";
  }

  lookupInfo(params: DownloadParams) {
    const code = params.cttkhac.find(
      (t) => t.ttruong === "TransactionID",
    )?.dlieu;

    return `Mã: ${code}`;
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    const code = params.cttkhac.find(
      (t) => t.ttruong === "TransactionID",
    )?.dlieu;

    const downloadUrl = `https://www.meinvoice.vn/tra-cuu/DownloadHandler.ashx?Type=pdf&Code=${code}`;
    const response = await fetch(downloadUrl, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    return response.arrayBuffer();
  }
}

// 0109266456 - CÔNG TY CỔ PHẦN GIAO THÔNG SỐ VIỆT NAM
class GioathongProvider implements HoadongocDownloadProvider {
  name = "CÔNG TY CỔ PHẦN GIAO THÔNG SỐ VIỆT NAM";
  detectProvider(params: DownloadParams): boolean {
    return params.nbmst === "0109266456";
  }

  lookupUrl(params: DownloadParams) {
    return "https://giaothongso.com.vn/tra-cuu-hoa-don-mtc/";
  }

  lookupInfo(params: DownloadParams) {
    const code = params.ttkhac.find((t) => t.ttruong === "Mã số bí mật")?.dlieu;

    return `Mã: ${code}`;
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    const invoiceCode = `${params.khhdon}${params.shdon}`;

    const pdfUrl = `https://giaothongso.com.vn/wp-content/uploads/pdf/0109266456-${invoiceCode}.pdf`;
    const response = await fetch(pdfUrl, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
    });

    if (!response.ok) {
      console.error(pdfUrl);
      console.error("Download failed", response.status);
      throw new Error("Download failed");
    }

    return response.arrayBuffer();
  }
}

const downloadProviders = [new MeinvoiceProvider(), new GioathongProvider()];

export function getDownloadProvider(params: DownloadParams) {
  return downloadProviders.find((p) => p.detectProvider(params));
}
