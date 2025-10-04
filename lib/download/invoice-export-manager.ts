import { EventEmitter } from "events";
import * as Sentry from "@sentry/nextjs";
import { convertHtmlToPdf } from "./pdf";
import * as Sentry from "@sentry/nextjs";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  FetchInvoiceOptions,
  InvoiceQueryType,
  InvoiceType,
  downloadXML,
  fetchAllInvoices,
  fetchInvoiceDetail,
} from "@/lib/download/hoadon-api";
import { createInvoicesSheet, createProductsSheet } from "@/lib/download/exel";
import { saveAs } from "file-saver";
import {
  formatDateForFilename,
  invoiceQueryTypeNames,
  invoiceTypeNames,
} from "./format";
import { sendGAEvent } from "../gtag";

export type ExportInput = {
  fromDate: Date;
  toDate: Date;
  invoiceType: InvoiceType;
  filter: FetchInvoiceOptions;
  queryTypes: InvoiceQueryType[];
  downloadFiles?: boolean;
  downloadPdf?: boolean;
  mergeDetails?: boolean;
  groupByFileType?: boolean;
};

export type InvoiceExportLog = {
  id?: string; // can be undefined
  message: string;
  status?: string;
};

export type InvoiceExportResult = {
  excelFileName: string;
  zipFileName?: string;
  failedDetails?: { invoice: InvoiceItem; queryType: InvoiceQueryType }[];
  failedXmls?: { invoice: InvoiceItem; queryType: InvoiceQueryType }[];
};

export type InvoiceItem = any;

type FailedDetail = { invoice: InvoiceItem; queryType: InvoiceQueryType };
type FailedXml = { invoice: InvoiceItem; queryType: InvoiceQueryType };

export class InvoiceExportManager extends EventEmitter {
  private logs = new Map<string, InvoiceExportLog>();
  private lastInput: ExportInput | null = null;

  public invoicesSheet1: InvoiceItem[] = [];
  public invoicesSheet2: InvoiceItem[] = [];
  public failedDetails: FailedDetail[] = [];
  public failedXmls: FailedXml[] = [];
  public failedFetches: { queryType: InvoiceQueryType }[] = [];

  constructor(private jwt: string) {
    super();
  }

  private _log(log: InvoiceExportLog) {
    const id = log.id ?? `${Date.now()}-${Math.random()}`;
    this.logs.set(id, { ...log, id });
    this.emit("log", { ...log });
  }

  async start(input: ExportInput) {
    sendGAEvent("export_start", {
      invoiceType: input.invoiceType,
      downloadFiles: input.downloadFiles ? "true" : "false",
    });
    this.lastInput = input;
    this.logs.clear();
    this.failedDetails = [];
    this.failedXmls = [];
    this.failedFetches = [];
    this.invoicesSheet1 = [];
    this.invoicesSheet2 = [];

    try {
      if (input.queryTypes.includes("query")) {
        this.invoicesSheet1 = await this.fetchInvoices(input, "query");
      }
      if (input.queryTypes.includes("sco-query")) {
        this.invoicesSheet2 = await this.fetchInvoices(input, "sco-query");
      }

      if (input.downloadFiles) {
        await this.handleDownloadXML(
          input,
          this.invoicesSheet1,
          this.invoicesSheet2,
        );
      }

      this._log({
        status: "success",
        message: "✅ Hoàn tất tải dữ liệu. Sẵn sàng để xuất file.",
      });

      sendGAEvent("export_finish", {
        invoiceType: input.invoiceType,
        downloadFiles: input.downloadFiles ? "true" : "false",
        totalInvoices: this.invoicesSheet1.length + this.invoicesSheet2.length,
        failedDetails: this.failedDetails.length,
        failedXmls: this.failedXmls.length,
        failedFetches: this.failedFetches.length,
      });

      this.emit("finish", {
        failedDetails: this.failedDetails,
        failedXmls: this.failedXmls,
        failedFetches: this.failedFetches,
      });
    } catch (err: any) {
      Sentry.captureException(err);
      console.error("Export failed:", err);
      sendGAEvent("export_failed", {
        invoiceType: input.invoiceType,
        downloadFiles: input.downloadFiles ? "true" : "false",
        errorMessage: err.message,
      });
      this._log({
        id: "result",
        message: "❌ Lỗi trong quá trình tải dữ liệu",
        status: "failed",
      });
    }
  }

  async retry() {
    sendGAEvent("export_retry");
    if (!this.lastInput) {
      this._log({
        message: "❌ Không có tác vụ nào để thử lại.",
        status: "failed",
      });
      return;
    }

    this._log({ message: "🔄 Đang thử lại các mục thất bại..." });

    const detailsToRetry = [...this.failedDetails];
    this.failedDetails = [];
    const xmlsToRetry = [...this.failedXmls];
    this.failedXmls = [];
    const fetchesToRetry = [...this.failedFetches];
    this.failedFetches = [];

    const detailPromises = detailsToRetry.map(({ invoice, queryType }) =>
      this._attachInvoiceDetails([invoice], queryType),
    );
    await Promise.all(detailPromises);

    if (this.lastInput.downloadFiles) {
      const xmlsToRetryByQueryType: Record<string, FailedXml[]> = {};
      for (const failed of xmlsToRetry) {
        if (!xmlsToRetryByQueryType[failed.queryType]) {
          xmlsToRetryByQueryType[failed.queryType] = [];
        }
        xmlsToRetryByQueryType[failed.queryType].push(failed);
      }

      for (const queryType in xmlsToRetryByQueryType) {
        const failedInvoices = xmlsToRetryByQueryType[
          queryType as InvoiceQueryType
        ].map((f) => f.invoice);
        await this.downloadInvoiceFiles(
          failedInvoices,
          queryType as InvoiceQueryType,
          null, // zipFolder is null, we will handle zipping in build()
        );
      }
    }

    const fetchPromises = fetchesToRetry.map(({ queryType }) =>
      this.fetchInvoices(this.lastInput!, queryType).then((newInvoices) => {
        if (queryType === "query") {
          this.invoicesSheet1.push(...newInvoices);
        } else {
          this.invoicesSheet2.push(...newInvoices);
        }
      }),
    );
    await Promise.all(fetchPromises);

    this._log({ message: "✅ Đã thử lại xong. Sẵn sàng để xuất file." });
    this.emit("finish", {
      failedDetails: this.failedDetails,
      failedXmls: this.failedXmls,
      failedFetches: this.failedFetches,
    });
  }

  async build() {
    if (!this.lastInput) {
      this._log({ message: "❌ Không có dữ liệu để xuất.", status: "failed" });
      return;
    }
    const input = this.lastInput;
    sendGAEvent("export_build", {
      invoiceType: input.invoiceType,
      downloadFiles: input.downloadFiles ? "true" : "false",
      totalInvoices: this.invoicesSheet1.length + this.invoicesSheet2.length,
    });

    const wb = XLSX.utils.book_new();
    let allProducts: any[] = [];

    this._log({
      id: "list-tab1",
      message: `🔄  Tạo sheet hóa đơn điện tử`,
    });
    const sheet1Result = await createInvoicesSheet(
      this.invoicesSheet1,
      input.invoiceType,
      input.mergeDetails ?? true,
    );
    XLSX.utils.book_append_sheet(wb, sheet1Result.mainSheet, "Hóa đơn điện tử");
    if (sheet1Result.products) {
      allProducts.push(...sheet1Result.products);
    }
    this._log({
      id: "list-tab1",
      message: "✅ Hoàn tất tạo sheet hóa đơn điện tử",
    });

    this._log({
      id: "list-tab2",
      message: `🔄  Tạo sheet hóa đơn có mã từ máy tính tiền`,
    });
    const sheet2Result = await createInvoicesSheet(
      this.invoicesSheet2,
      input.invoiceType,
      input.mergeDetails ?? true,
    );
    XLSX.utils.book_append_sheet(
      wb,
      sheet2Result.mainSheet,
      "HĐ có mã từ máy tính tiền",
    );
    if (sheet2Result.products) {
      allProducts.push(...sheet2Result.products);
    }
    this._log({
      id: "list-tab2",
      message: "✅ Hoàn tất tạo sheet hóa đơn có mã từ máy tính tiền",
    });

    if (allProducts.length > 0) {
      this._log({
        message: "🔄 Đang tạo sheet DS sản phẩm...",
        id: "product-sheet",
      });
      const productsSheet = createProductsSheet(allProducts);
      XLSX.utils.book_append_sheet(wb, productsSheet, "DS sản phẩm");
      this._log({
        message: "✅ Hoàn tất tạo sheet DS sản phẩm",
        id: "product-sheet",
      });
    }

    this._log({
      message: "🔄 Đang tạo file Excel...",
      id: "excel",
    });

    const excelFileName = getExcelFileName(input);
    XLSX.writeFile(wb, excelFileName);
    this._log({
      status: "success",
      message: "✅ Đã tải xong file Excel",
      id: "excel",
    });

    let zipFileName: string | undefined;
    if (input.downloadFiles) {
      this._log({
        id: "zip-start",
        message: "🔄 Đang tạo file zip XML...",
      });

      const rootZip = new JSZip();
      const rootFolder = rootZip.folder(getZipRootFolderName(input));
      if (rootFolder) {
        const allInvoices = [...this.invoicesSheet1, ...this.invoicesSheet2];
        
        if (input.groupByFileType) {
          const xmlFolder = rootFolder.folder("xml");
          const htmlFolder = !input.downloadPdf ? rootFolder.folder("html") : undefined;
          const pdfFolder = input.downloadPdf ? rootFolder.folder("pdf") : undefined;

          for (const invoice of allInvoices) {
            if (invoice.xmlBlob) {
              const zip = await JSZip.loadAsync(invoice.xmlBlob);
              const files = Object.keys(zip.files);
              const invoicePrefix = `${invoice.khhdon}_${invoice.shdon}`;

              for (const filename of files) {
                const file = zip.files[filename];
                if (file.dir) continue;

                const lowerFilename = filename.toLowerCase();

                if (lowerFilename.endsWith(".xml")) {
                  const content = await file.async("blob");
                  xmlFolder?.file(`${invoicePrefix}__${filename}`, content);
                } else if (input.downloadPdf && lowerFilename.endsWith(".html")) {
                  const htmlContent = await file.async("string");
                  try {
                    this._log({
                      id: `pdf-${invoice.id}`,
                      message: `🔄 Đang chuyển đổi hóa đơn ${invoicePrefix} sang PDF...`,
                    });
                    const pdfBlob = await convertHtmlToPdf(htmlContent);
                    pdfFolder?.file(`${invoicePrefix}.pdf`, pdfBlob);
                    this._log({
                      id: `pdf-${invoice.id}`,
                      message: `✅ Chuyển đổi PDF cho hóa đơn ${invoicePrefix} thành công.`,
                    });
                  } catch (e: any) {
                    Sentry.captureException(e);
                    this._log({
                      id: `pdf-error-${invoice.id}`,
                      message: `❌ Lỗi chuyển đổi PDF cho hóa đơn ${invoicePrefix}. File HTML sẽ được giữ lại. Lỗi: ${e.message}`,
                      status: "failed",
                    });
                    // Fallback to saving the HTML file
                    const content = await file.async("blob");
                    const fallbackHtmlFolder = rootFolder.folder("html_fallback");
                    fallbackHtmlFolder?.file(`${invoicePrefix}__${filename}`, content);
                  }
                } else if (htmlFolder) {
                  const content = await file.async("blob");
                  htmlFolder.file(`${invoicePrefix}__${filename}`, content);
                }
              }
            }
          }
        } else {
          // Original logic: separate folder for each invoice
          for (const invoice of allInvoices) {
            if (invoice.xmlBlob) {
              const folderName = `${invoice.khhdon}_${invoice.shdon}`;
              const invoiceFolder = rootFolder.folder(folderName);
              if (input.downloadPdf) {
                const zip = await JSZip.loadAsync(invoice.xmlBlob);
                const files = Object.keys(zip.files);
                for (const filename of files) {
                  const file = zip.files[filename];
                  if (file.dir) continue;
                  const lowerFilename = filename.toLowerCase();
                  if (lowerFilename.endsWith(".html")) {
                    const htmlContent = await file.async("string");
                    try {
                      this._log({
                        id: `pdf-${invoice.id}`,
                        message: `🔄 Đang chuyển đổi hóa đơn ${folderName} sang PDF...`,
                      });
                      const pdfBlob = await convertHtmlToPdf(htmlContent);
                      invoiceFolder?.file(`${folderName}.pdf`, pdfBlob);
                      this._log({
                        id: `pdf-${invoice.id}`,
                        message: `✅ Chuyển đổi PDF cho hóa đơn ${folderName} thành công.`,
                      });
                    } catch (e: any) {
                      Sentry.captureException(e);
                      this._log({
                        id: `pdf-error-${invoice.id}`,
                        message: `❌ Lỗi chuyển đổi PDF cho hóa đơn ${folderName}. File HTML sẽ được giữ lại. Lỗi: ${e.message}`,
                        status: "failed",
                      });
                      const content = await file.async("blob");
                      invoiceFolder?.file(filename, content);
                    }
                  } else {
                    const content = await file.async("blob");
                    invoiceFolder?.file(filename, content);
                  }
                }
              } else {
                await invoiceFolder?.loadAsync(invoice.xmlBlob);
              }
            }
          }
        }
        
        const resultZip = await rootFolder.generateAsync({ type: "blob" });
        zipFileName = getZipFileName(input);
        saveAs(resultZip, zipFileName);
        this._log({
          id: "zip-end",
          status: "success",
          message: "✅ Đã tải xong file zip XML",
        });
      } else {
        this._log({
          message: "❌ Lỗi tạo file zip XML",
          id: "zip",
        });
      }
    }

    this._log({
      status: "success",
      message: "✅ 📥✨ Hoàn tất tải dữ liệu 🎉🎯🚀✅",
    });

    sendGAEvent("export_success", {
      invoiceType: input.invoiceType,
      downloadFiles: input.downloadFiles ? "true" : "false",
      totalInvoices: this.invoicesSheet1.length + this.invoicesSheet2.length,
      excelFileName,
      zipFileName: zipFileName ?? "none",
    });

    this.emit("build-finish", {
      excelFileName,
      zipFileName,
    } as InvoiceExportResult);
  }

  private async handleDownloadXML(
    input: ExportInput,
    invoicesSheet1: any[],
    invoicesSheet2: any[],
  ): Promise<void> {
    if (input.queryTypes.includes("query")) {
      await this.downloadInvoiceFiles(invoicesSheet1, "query", null);
    }
    if (input.queryTypes.includes("sco-query")) {
      await this.downloadInvoiceFiles(invoicesSheet2, "sco-query", null);
    }
  }

  private async downloadInvoiceFiles(
    invoices: any[],
    queryType: InvoiceQueryType,
    zipFolder: JSZip | null, // This is no longer used for zipping directly
  ) {
    if (invoices.length === 0) return;

    this._log({
      id: `download-files-${queryType}`,
      message: `🔄 Đang tải file XML cho ${invoices.length} hóa đơn...`,
    });

    let index = 0;
    const total = invoices.length;
    for (const invoice of invoices) {
      this._log({
        id: `download-files-${queryType}`,
        message: `🔄 Đang tải file XML cho hóa đơn ${invoice.khhdon}/${invoice.shdon} (${index}/${total})`,
      });
      try {
        const blob = await downloadXML(this.jwt, queryType, {
          nbmst: invoice.nbmst,
          khhdon: invoice.khhdon,
          shdon: invoice.shdon,
          khmshdon: invoice.khmshdon,
        });
        invoice.xmlBlob = blob; // Attach blob to invoice object
      } catch (error: any) {
        Sentry.captureException(error);
        if (error?.message?.includes("Không tồn tại")) {
          continue;
        }
        this.failedXmls.push({ invoice, queryType });
        this._log({
          id: `download-error-${invoice.id}`,
          message: `❌ Lỗi khi tải XML cho hóa đơn ${invoice.shdon}`,
          status: "failed",
        });
      }
      index++;
    }

    this._log({
      id: `download-files-${queryType}`,
      message: `✅ Hoàn tất tải XML ${invoiceQueryTypeNames[queryType]}`,
    });
  }

  private async fetchInvoices(input: ExportInput, queryType: InvoiceQueryType) {
    this._log({
      id: `list-${queryType}`,
      message: `🔄 Đang tải danh sách ${invoiceQueryTypeNames[queryType]}...`,
    });

    try {
      const invoices = await fetchAllInvoices(
        this.jwt,
        input.fromDate,
        input.toDate,
        input.filter,
        queryType,
        input.invoiceType,
      );

      this._log({
        id: `list-${queryType}`,
        message: `✅ Danh sách ${invoiceQueryTypeNames[queryType]} hoàn tất! (${invoices.length} hóa đơn)`,
      });

      await this._attachInvoiceDetails(invoices, queryType);
      return invoices;
    } catch (err) {
      Sentry.captureException(err);
      this._log({
        id: `list-${queryType}`,
        message: `❌ Lỗi khi tải danh sách ${invoiceQueryTypeNames[queryType]}...`,
        status: "failed",
      });
      this.failedFetches.push({ queryType });
      return [];
    }
  }

  private async _attachInvoiceDetails(
    invoices: any[],
    queryType: InvoiceQueryType,
  ) {
    const concurrency = 5;
    let index = 0;
    const total = invoices.length;

    const workers = Array.from({ length: concurrency }, async () => {
      while (index < invoices.length) {
        const i = index++;
        const invoice = invoices[i];

        this._log({
          id: `detail-${invoice.id}`,
          message: `🚧 Chi tiết SP hóa đơn ${invoice.khhdon}/${invoice.shdon} (${i + 1}/${total})`,
        });

        try {
          const detail = await fetchInvoiceDetail(this.jwt, queryType, {
            nbmst: invoice.nbmst,
            khhdon: invoice.khhdon,
            shdon: invoice.shdon,
            khmshdon: invoice.khmshdon,
          });

          invoice.detail = detail;
          this._log({
            id: `detail-${invoice.id}`,
            message: `✅ Chi tiết SP hóa đơn ${invoice.khhdon}/${invoice.shdon} (${i + 1}/${total})`,
          });
        } catch (err) {
          Sentry.captureException(err);
          console.error(
            `Failed to fetch detail for invoice ${invoice.id}`,
            err,
          );
          invoice.detail = null;
          this.failedDetails.push({ invoice, queryType });
          this._log({
            id: `detail-${invoice.id}`,
            message: `❌ Chi tiết hóa đơn ${invoice.khhdon} thất bại (${i + 1}/${total})`,
            status: "failed",
          });
        }
      }
    });

    await Promise.all(workers);
    this._log({ message: "✅ Hoàn tất tải chi tiết hóa đơn" });
  }
}

function getExcelFileName(input: ExportInput) {
  const invoiceType = input.invoiceType;
  const fromDate = formatDateForFilename(input.fromDate);
  const toDate = formatDateForFilename(input.toDate);
  const typeName = invoiceTypeNames[invoiceType];

  return `tai-hoa-don_${typeName}_${fromDate}_${toDate}.xlsx`;
}

function getZipFileName(input: ExportInput) {
  const invoiceType = input.invoiceType;
  const fromDate = formatDateForFilename(input.fromDate);
  const toDate = formatDateForFilename(input.toDate);
  const typeName = invoiceTypeNames[invoiceType];
  return `tai-hoa-don_${typeName}_${fromDate}_${toDate}.zip`;
}

function getZipRootFolderName(input: ExportInput) {
  const invoiceType = input.invoiceType;
  const fromDate = formatDateForFilename(input.fromDate);
  const toDate = formatDateForFilename(input.toDate);
  const typeName = invoiceTypeNames[invoiceType];
  return `tai-hoa-don_${typeName}_${fromDate}_${toDate}`;
}
