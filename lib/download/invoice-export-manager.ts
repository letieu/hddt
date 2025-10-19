import { EventEmitter } from "events";
import { convertHtmlToPdf } from "./pdf";
import * as ExcelJS from "exceljs";
import JSZip from "jszip";
import {
  FetchInvoiceOptions,
  InvoiceQueryType,
  InvoiceType,
  downloadXML,
  fetchAllInvoices,
  fetchInvoiceDetail,
} from "@/lib/download/hoadon-api";
import {
    createBK011Sheet,
  createInvoicesSheet,
  createProductsSheet,
  excelToBlob,
} from "@/lib/download/exel";
import { saveAs } from "file-saver";
import {
  formatDateForFilename,
  invoiceQueryTypeNames,
  invoiceTypeNames,
} from "./format";

export type ExportInput = {
  fromDate: Date;
  toDate: Date;
  invoiceType: InvoiceType;
  filter: FetchInvoiceOptions;
  queryTypes: InvoiceQueryType[];
  downloadXml?: boolean;
  downloadHtml?: boolean;
  downloadPdf?: boolean;
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

type FailedDetail = { invoice: InvoiceItem; queryType: InvoiceItem };
type FailedXml = { invoice: InvoiceItem; queryType: InvoiceQueryType };

export class InvoiceExportManager extends EventEmitter {
  private logs = new Map<string, InvoiceExportLog>();
  private lastInput: ExportInput | null = null;
  private sharedAssetsAdded = new Set<string>();

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
    const downloadFiles =
      input.downloadXml || input.downloadHtml || input.downloadPdf;
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

      if (downloadFiles) {
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

      this.emit("finish", {
        failedDetails: this.failedDetails,
        failedXmls: this.failedXmls,
        failedFetches: this.failedFetches,
      });
    } catch (err: any) {
      console.error("Export failed:", err);
      this._log({
        id: "result",
        message: "❌ Lỗi trong quá trình tải dữ liệu",
        status: "failed",
      });
    }
  }

  async retry() {
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

    const downloadFiles =
      this.lastInput.downloadXml ||
      this.lastInput.downloadHtml ||
      this.lastInput.downloadPdf;
    if (downloadFiles) {
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
    this.sharedAssetsAdded.clear();
    const input = this.lastInput;
    const downloadFiles =
      input.downloadXml || input.downloadHtml || input.downloadPdf;

    const wb = new ExcelJS.Workbook();

    // sheet 1
    this._log({
      id: "excel",
      message: `🔄  Tạo sheet hóa đơn điện tử`,
    });
    createInvoicesSheet(
      wb,
      "Hóa đơn điện tử",
      this.invoicesSheet1,
      input.invoiceType,
    );

    // sheet 2
    this._log({
      id: "excel",
      message: `🔄  Tạo sheet hóa đơn có mã từ máy tính tiền`,
    });
    createInvoicesSheet(
      wb,
      "HĐ có mã từ máy tính tiền",
      this.invoicesSheet2,
      input.invoiceType,
    );

    // sheet 3: DS sản phẩm
    const allProducts = [
      ...this.invoicesSheet1,
      ...this.invoicesSheet2,
    ].flatMap(
      (invoice) =>
        invoice.detail?.hdhhdvu?.map((product: any) => ({
          ...product,
          invoice: {
            ...invoice,
            detail: null,
          },
        })) ?? [],
    );

    if (allProducts.length > 0) {
      this._log({
        message: "🔄 Đang tạo sheet DS sản phẩm...",
        id: "excel",
      });
      createProductsSheet(wb, "DS sản phẩm", allProducts);

      if (input.invoiceType === "purchase") {
        this._log({
          message: "🔄 Đang tạo sheet BẢNG KÊ HOÁ ĐƠN...",
          id: "excel",
        });
        createBK011Sheet(wb, allProducts);
      }
    }

    this._log({
      message: "🔄 Hoàn tất tạo file Excel ...",
      id: "excel",
    });

    const excelFileName = getExcelFileName(input);
    const blob = await excelToBlob(wb);
    saveAs(blob, excelFileName);
    this._log({
      status: "success",
      message: "✅ Đã tải xong file Excel",
      id: "excel",
    });

    let zipFileName: string | undefined;
    if (downloadFiles) {
      this._log({
        id: "zip-start",
        message: "🔄 Đang tạo file zip XML...",
      });

      const rootZip = new JSZip();
      const rootFolder = rootZip.folder(getZipRootFolderName(input));
      if (rootFolder) {
        // Process invoices separately by type to group them
        if (this.invoicesSheet1.length > 0) {
          const queryTypeFolder = rootFolder.folder(
            invoiceQueryTypeNames["query"],
          );
          if (queryTypeFolder) {
            if (input.downloadPdf) {
              await this._processPdfConversions(
                this.invoicesSheet1,
                queryTypeFolder,
                input,
              );
            } else {
              for (const invoice of this.invoicesSheet1) {
                if (!invoice.xmlBlob) continue;
                const invoicePrefix = `${invoice.khhdon}_${invoice.shdon}`;
                await this._processInvoiceFiles(
                  invoice,
                  invoicePrefix,
                  queryTypeFolder,
                  input,
                  null,
                  null,
                );
              }
            }
          }
        }

        if (this.invoicesSheet2.length > 0) {
          const scoQueryTypeFolder = rootFolder.folder(
            invoiceQueryTypeNames["sco-query"],
          );
          if (scoQueryTypeFolder) {
            if (input.downloadPdf) {
              await this._processPdfConversions(
                this.invoicesSheet2,
                scoQueryTypeFolder,
                input,
              );
            } else {
              for (const invoice of this.invoicesSheet2) {
                if (!invoice.xmlBlob) continue;
                const invoicePrefix = `${invoice.khhdon}_${invoice.shdon}`;
                await this._processInvoiceFiles(
                  invoice,
                  invoicePrefix,
                  scoQueryTypeFolder,
                  input,
                  null,
                  null,
                );
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

  private async _processPdfConversions(
    invoices: any[],
    rootFolder: JSZip,
    input: ExportInput,
  ) {
    const concurrency = 3;
    let index = 0;
    const total = invoices.filter((inv) => inv.xmlBlob).length;

    const workers = Array.from({ length: concurrency }, async () => {
      while (index < invoices.length) {
        const i = index++;
        const invoice = invoices[i];

        if (!invoice.xmlBlob) continue;

        const invoicePrefix = `${invoice.khhdon}_${invoice.shdon}`;

        try {
          const zip = await JSZip.loadAsync(invoice.xmlBlob);
          const files = Object.keys(zip.files);
          let pdfBlob: Blob | null = null;
          let pdfError: Error | null = null;

          const htmlFile = files.find(
            (f) => !zip.files[f].dir && f.toLowerCase().endsWith(".html"),
          );
          const detailsJsFile = files.find(
            (f) => !zip.files[f].dir && f.toLowerCase().endsWith("details.js"),
          );

          if (htmlFile) {
            const file = zip.files[htmlFile];
            const htmlContent = await file.async("string");

            let detailsJsContent: string | undefined;
            if (detailsJsFile) {
              detailsJsContent = await zip.files[detailsJsFile].async("string");
            }

            try {
              this._log({
                id: `pdf-${invoice.id}`,
                message: `🔄 Đang chuyển đổi hóa đơn ${invoicePrefix} sang PDF... (${i + 1}/${total})`,
              });
              pdfBlob = await convertHtmlToPdf(htmlContent, detailsJsContent);
              this._log({
                id: `pdf-${invoice.id}`,
                message: `✅ Chuyển đổi PDF cho hóa đơn ${invoicePrefix} thành công. (${i + 1}/${total})`,
              });
            } catch (e: any) {
              pdfError = e;
              console.error(e);
              this._log({
                id: `pdf-error-${invoice.id}`,
                message: `❌ Lỗi chuyển đổi PDF cho hóa đơn ${invoicePrefix}. File HTML sẽ được giữ lại. Lỗi: ${e.message}`,
                status: "failed",
              });
            }
          }

          await this._processInvoiceFiles(
            invoice,
            invoicePrefix,
            rootFolder,
            input,
            pdfBlob,
            pdfError,
          );
        } catch (err) {
          console.error(`Failed to process invoice ${invoicePrefix}`, err);
          this._log({
            id: `process-error-${invoice.id}`,
            message: `❌ Lỗi xử lý hóa đơn ${invoicePrefix}`,
            status: "failed",
          });
        }
      }
    });

    await Promise.all(workers);
    this._log({ message: "✅ Hoàn tất chuyển đổi PDF" });
  }

  private async _processInvoiceFiles(
    invoice: any,
    invoicePrefix: string,
    rootFolder: JSZip,
    input: ExportInput,
    pdfBlob: Blob | null,
    pdfError: Error | null,
  ) {
    const zip = await JSZip.loadAsync(invoice.xmlBlob);
    const files = Object.keys(zip.files);

    // Add the successfully generated PDF if user wants PDF
    if (pdfBlob && input.downloadPdf) {
      const pdfFileName = `${invoicePrefix}.pdf`;
      const pdfDestFolder = rootFolder.folder("pdf");
      pdfDestFolder?.file(pdfFileName, pdfBlob);
    }

    const shouldDownloadHtml = input.downloadHtml;

    let htmlRootFolder: JSZip | null = null;
    if (shouldDownloadHtml) {
      htmlRootFolder =
        pdfError && input.downloadPdf
          ? rootFolder.folder("html_fallback")
          : rootFolder.folder("html");
    }

    // Add all other files from the original invoice zip
    for (const filename of files) {
      const file = zip.files[filename];
      if (file.dir) continue;

      const lowerFilename = filename.toLowerCase();
      const content = await file.async("blob");

      if (lowerFilename.endsWith(".xml")) {
        // Only add XML if user wants it - flatten to xml folder
        if (input.downloadXml) {
          const xmlFolder = rootFolder.folder("xml");
          const xmlFilename = `${invoicePrefix}__${filename}`;
          xmlFolder?.file(xmlFilename, content);
        }
      } else if (shouldDownloadHtml && htmlRootFolder) {
        if (lowerFilename.endsWith(".html")) {
          // This is the main HTML file for the invoice.
          // Rename it and place it in the htmlRootFolder.
          const htmlFilename = `${invoicePrefix}.html`;
          htmlRootFolder.file(htmlFilename, content);
        } else {
          // These are shared assets (JS, images, etc.)
          // Add them to the htmlRootFolder only if they haven't been added before.
          if (!this.sharedAssetsAdded.has(filename)) {
            htmlRootFolder.file(filename, content);
            this.sharedAssetsAdded.add(filename);
          }
        }
      }
    }
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
