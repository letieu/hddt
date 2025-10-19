import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { tryResolveCaptcha } from "@/lib/captcha";
import { DownloadParams, HoadongocDownloadProvider } from ".";
import { convertHtmlToPdf } from "@/lib/download/pdf";

/**
 * Petrolimex - https://hoadon.petrolimex.com.vn
 **/
export class PetrolimexProvider implements HoadongocDownloadProvider {
  name = "Petrolimex";
  BASE_URL = "https://hoadon.petrolimex.com.vn";

  detectProvider(params: DownloadParams): boolean {
    return params.nbcks?.includes("TẬP ĐOÀN XĂNG DẦU VIỆT NAM");
  }

  lookupUrl(params: DownloadParams) {
    return "https://hoadon.petrolimex.com.vn/";
  }

  lookupInfo(params: DownloadParams) {
    const code = params.cttkhac.find((t) => t.ttruong === "Fkey")?.dlieu;
    return `Mã: ${code}`;
  }

  async download(params: DownloadParams): Promise<ArrayBuffer> {
    const invoiceNumber = params.cttkhac.find(
      (t) => t.ttruong === "Fkey",
    )?.dlieu;
    if (!invoiceNumber) {
      throw new Error("Invoice number not found");
    }
    const pdfBlob = await this._getInvoicePdf(invoiceNumber);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    return arrayBuffer;
  }

  async _getInvoicePdf(invoiceNumber: string): Promise<Blob> {
    const jar = new CookieJar();
    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }),
    );

    // Step 1: visit page to set cookies and get CSRF token
    const pageResp = await client.get(
      `${this.BASE_URL}/SearchInvoicebycode/Index`,
    );
    const $ = cheerio.load(pageResp.data);
    const token = $('input[name="__RequestVerificationToken"]').val();
    if (!token || typeof token !== "string")
      throw new Error("CSRF token not found or is not a string");

    // Step 2: get captcha
    const captchaResp = await client.get(`${this.BASE_URL}/Captcha/Show`, {
      responseType: "arraybuffer",
    });
    const captchaBase64 = Buffer.from(captchaResp.data).toString("base64");

    // Step 3: resolve captcha (user-provided)
    const captchaText = await tryResolveCaptcha(captchaBase64);
    if (!captchaText) throw new Error("Captcha could not be solved");

    // Step 4: submit search form
    const formData = new URLSearchParams({
      __RequestVerificationToken: token,
      tab: "content1",
      strFkey: invoiceNumber,
      captch: captchaText,
      submit: "Tìm kiếm",
    });

    const searchResp = await client.post(
      `${this.BASE_URL}/SearchInvoicebycode/Index`,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: `${this.BASE_URL}/SearchInvoicebycode/Index`,
        },
      },
    );

    // Step 5: extract the PDF link
    const checkCode = extractCheckCode(searchResp.data);
    if (!checkCode) throw new Error("Check code not found");

    const getPdfStrFormData = new FormData();
    getPdfStrFormData.append("checkCode", checkCode);
    const pdfStrRes = await client.post(
      `${this.BASE_URL}/SearchInvoicebycode/ajxPreview`,
      getPdfStrFormData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: `${this.BASE_URL}/SearchInvoicebycode/Index`,
        },
      },
    );
    const pdfStr = pdfStrRes.data.str;
    const pdfBlob = await convertHtmlToPdf(pdfStr);

    return pdfBlob;
  }
}

function extractCheckCode(html: string) {
  const $ = cheerio.load(html);
  const link = $('a[href*="checkCode="]').attr("href");
  if (!link) return null;

  const url = new URL(link, "https://example.com"); // base URL to make URL() work
  return url.searchParams.get("checkCode");
}

