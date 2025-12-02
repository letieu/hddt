import { DownloadParams, HoadongocDownloadProvider } from ".";

/**
 * 0106026495:Công ty TNHH Hóa đơn điện tử M-INVOICE
 **/
export class MInvoiceProvider implements HoadongocDownloadProvider {
  name = "M-INVOICE";

  detectProvider(params: DownloadParams): boolean {
    return params.msttcgp === "0106026495";
  }

  lookupUrl(params: DownloadParams) {
    return "https://tracuuhoadon.minvoice.com.vn/tra-cuu-hoa-don";
  }

  lookupInfo(params: DownloadParams) {
    const code = params.cttkhac.find((t) => t.ttruong === "Số bảo mật")?.dlieu;

    return `Mã: ${code}`;
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    const code = params.cttkhac.find((t) => t.ttruong === "Số bảo mật")?.dlieu;

    const downloadUrl = `https://tracuuhoadon.minvoice.com.vn/api/Search/SearchInvoice?masothue=${params.nbmst}&sobaomat=${code}&type=PDF`;
    const response = await fetch(downloadUrl, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
