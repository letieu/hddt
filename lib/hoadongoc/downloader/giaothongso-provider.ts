import { DownloadParams, HoadongocDownloadProvider } from ".";

// 0109266456 - CÔNG TY CỔ PHẦN GIAO THÔNG SỐ VIỆT NAM
export class GioathongProvider implements HoadongocDownloadProvider {
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

    // firstly, need navigate to this link first
    // https://giaothongso.com.vn/tra-cuu-hoa-don-mtc/ZW59TVUM0KOST89/
    const res = await fetch(
      `https://giaothongso.com.vn/tra-cuu-hoa-don-mtc/${invoiceCode}/`,
    );
    if (!res.ok) {
      console.log(res);
      console.error("Navigate failed", res.status);
      throw new Error("Download failed");
    }

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
