import { EventEmitter } from "events";
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
import { createInvoicesSheet } from "@/lib/download/exel";
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
  downloadFiles?: boolean;
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
    this.lastInput = input;
    this.logs.clear();
    this.failedDetails = [];
    this.failedXmls = [];
    this.failedFetches = [];
    this.invoicesSheet1 = [];
    this.invoicesSheet2 = [];

    try {
      this.invoicesSheet1 = await this.fetchInvoices(input, "query");
      this.invoicesSheet2 = await this.fetchInvoices(input, "sco-query");

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

      this.emit("finish", {
        failedDetails: this.failedDetails,
        failedXmls: this.failedXmls,
        failedFetches: this.failedFetches,
      });
    } catch (err) {
      Sentry.captureException(err);
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
      this._log({ message: "❌ Không có tác vụ nào để thử lại.", status: "failed" });
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

    this._log({
      id: "list-tab1",
      message: `🔄  Tạo sheet hóa đơn điện tử`,
    });
    const sheet1 = await createInvoicesSheet(this.invoicesSheet1, input.invoiceType);
    this._log({
      id: "list-tab1",
      message: "✅ Hoàn tất tạo sheet hóa đơn điện tử",
    });

    this._log({
      id: "list-tab2",
      message: `🔄  Tạo sheet hóa đơn có mã từ máy tính tiền`,
    });
    const sheet2 = await createInvoicesSheet(this.invoicesSheet2, input.invoiceType);
    this._log({
      id: "list-tab2",
      message: "✅ Hoàn tất tạo sheet hóa đơn có mã từ máy tính tiền",
    });

    this._log({
      message: "🔄 Đang tạo file Excel...",
      id: "excel",
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet1, "Hóa đơn điện tử");
    XLSX.utils.book_append_sheet(wb, sheet2, "HĐ có mã từ máy tính tiền");

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
        for (const invoice of allInvoices) {
          if (invoice.xmlBlob) {
            const folderName = `${invoice.nbmst}__${invoice.shdon}`;
            const invoiceFolder = rootFolder.folder(folderName);
            await invoiceFolder?.loadAsync(invoice.xmlBlob);
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
    await this.downloadInvoiceFiles(invoicesSheet1, "query", null);
    await this.downloadInvoiceFiles(invoicesSheet2, "sco-query", null);
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
