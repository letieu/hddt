import { DownloadParams, HoadongocDownloadProvider } from ".";

// meinvoice (Misa)
export class MeinvoiceProvider implements HoadongocDownloadProvider {
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
