export type DownloadParams = {
  msttcgp: string; // MST cung cấp DV (Provider)
  nbmst: string; // MST người bán
  id: string; // ID
  ttkhac: {
    ttruong: string;
    kdlieu: string;
    dlieu: string;
  }[];
};

interface HoadongocDownloadProvider {
  name: string;
  lookupUrl(params: DownloadParams): Promise<string>;
  download(params: DownloadParams): Promise<ArrayBuffer>;
}

// meinvoice (Misa)
class MeinvoiceProvider implements HoadongocDownloadProvider {
  name = "Meinvoice";

  async lookupUrl(params: DownloadParams) {
    return "https://www.meinvoice.vn/tra-cuu/";
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    const code = params.ttkhac.find(
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

export const meinvoiceProvider = new MeinvoiceProvider();
