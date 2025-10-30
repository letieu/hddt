import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { DownloadParams, HoadongocDownloadProvider } from ".";
import { tryResolveCaptcha } from "@/lib/captcha";

/**
 * Fast - Công ty Cổ phần phần mềm quản lý doanh nghiệp
 * MST: 0100727825
 * Base site: https://invoice.fast.com.vn/tra-cuu-hoa-don-dien-tu/
 */
export class FastProvider implements HoadongocDownloadProvider {
  name = "0100727825: Fast - Công ty Cổ phần phần mềm quản lý doanh nghiệp";
  BASE_URL = "https://invoice.fast.com.vn";
  EINVOICE_BASE = "https://einvoice.fast.com.vn";

  detectProvider(params: DownloadParams): boolean {
    return params.msttcgp === "0100727825";
  }

  lookupUrl(params: DownloadParams): string {
    return `${this.BASE_URL}/tra-cuu-hoa-don-dien-tu/`;
  }

  lookupInfo(params: DownloadParams): string {
    const code = params.ttkhac.find((t) => t.ttruong === "KeySearch")?.dlieu;
    return `Mã: ${code}`;
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    const code = params.ttkhac.find((t) => t.ttruong === "KeySearch")?.dlieu;
    if (!code) throw new Error("No invoice code found");

    const jar = new CookieJar();
    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br, zstd",
          Connection: "keep-alive",
        },
      }),
    );

    // Step 1: visit main page to set cookies
    await client.get(`${this.BASE_URL}/tra-cuu-hoa-don-dien-tu/`);

    // Step 2: request download link via admin-ajax.php
    const formData = new URLSearchParams({
      action: "ajax_submit_search_invoice",
      formData: `type=3&keyword=${encodeURIComponent(code)}`,
    });

    const ajaxResp = await client.post(
      `${this.BASE_URL}/wp-admin/admin-ajax.php`,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Origin: this.BASE_URL,
          Referer: `${this.BASE_URL}/tra-cuu-hoa-don-dien-tu/`,
        },
      },
    );

    if (!ajaxResp.data?.success) {
      console.log(ajaxResp.data);
      throw new Error("Failed to retrieve invoice link from Fast");
    }

    const invoiceUrl = ajaxResp.data.data?.url;
    if (!invoiceUrl) {
      throw new Error("Invoice URL not found in response");
    }

    // Step 3: call the returned URL to get final PDF file
    const pdfResp = await client.get(invoiceUrl, {
      responseType: "arraybuffer",
      headers: {
        Referer: `${this.BASE_URL}/tra-cuu-hoa-don-dien-tu/`,
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
      },
    });

    if (pdfResp.status !== 200) {
      throw new Error(`Failed to download PDF (status ${pdfResp.status})`);
    }

    return pdfResp.data as ArrayBuffer;
  }
}
