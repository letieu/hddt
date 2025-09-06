import { EventEmitter } from "events";
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
};

export type InvoiceItem = any;

export class InvoiceExportManager extends EventEmitter {
  private logs = new Map<string, InvoiceExportLog>();

  constructor(private jwt: string) {
    super();
  }

  private _log(log: InvoiceExportLog) {
    const id = log.id ?? `${Date.now()}-${Math.random()}`;
    this.logs.set(id, { ...log, id });
    this.emit("log", { ...log });
  }

  async start(input: ExportInput) {
    this.logs.clear();

    try {
      const invoicesSheet1 = await this.fetchInvoices(input, "query");
      this._log({
        id: "list-tab1",
        message: `🔄  Tạo sheet hóa đơn điện tử`,
      });
      const sheet1 = await createInvoicesSheet(
        invoicesSheet1,
        input.invoiceType,
      );
      this._log({
        id: "list-tab1",
        message: "✅ Hoàn tất tạo sheet hóa đơn điện tử",
      });

      const invoicesSheet2 = await this.fetchInvoices(input, "sco-query");
      this._log({
        id: "list-tab2",
        message: `🔄  Tạo sheet hóa đơn có mã từ máy tính tiền`,
      });
      const sheet2 = await createInvoicesSheet(
        invoicesSheet2,
        input.invoiceType,
      );
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
        zipFileName = await this.handleDownloadXML(
          input,
          invoicesSheet1,
          invoicesSheet2,
        );
      }

      this._log({
        status: "success",
        message: "✅ 📥✨ Hoàn tất tải dữ liệu 🎉🎯🚀✅",
      });

      this.emit("finish", {
        excelFileName,
        zipFileName,
      } as InvoiceExportResult);
    } catch (err) {
      console.error("Export failed:", err);
      this._log({
        id: "result",
        message: "❌ Lỗi trong quá trình tải dữ liệu",
        status: "failed",
      });
    }
  }

  private async handleDownloadXML(
    input: ExportInput,
    invoicesSheet1: any[],
    invoicesSheet2: any[],
  ): Promise<string | undefined> {
    this._log({
      id: "zip-start",
      message: "🔄 Đang tạo file zip XML...",
    });

    const rootZip = new JSZip();
    const rootFolder = rootZip.folder(getZipRootFolderName(input));
    if (rootFolder === null) {
      this._log({
        message: "❌ Lỗi tạo file zip XML",
        id: "zip",
      });
      return;
    }

    await this.downloadInvoiceFiles(
      invoicesSheet1,
      "query",
      rootFolder.folder(invoiceQueryTypeNames["query"]),
    );
    await this.downloadInvoiceFiles(
      invoicesSheet2,
      "sco-query",
      rootFolder.folder(invoiceQueryTypeNames["sco-query"]),
    );
    const resultZip = await rootFolder.generateAsync({ type: "blob" });
    const zipFileName = getZipFileName(input);
    saveAs(resultZip, zipFileName);

    this._log({
      id: "zip-end",
      status: "success",
      message: "✅ Đã tải xong file zip XML",
    });
    return zipFileName;
  }

  private async downloadInvoiceFiles(
    invoices: any[],
    queryType: InvoiceQueryType,
    zipFolder: JSZip | null,
  ) {
    if (invoices.length === 0) return;
    if (zipFolder === null) {
      this._log({
        message: "❌ Lỗi tạo file zip",
        id: "zip",
      });
      return;
    }

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
        const folderName = `${invoice.nbmst}__${invoice.shdon}`;
        const invoiceFolder = zipFolder?.folder(folderName);
        await invoiceFolder?.loadAsync(blob);
      } catch (error: any) {
        if (error?.message?.includes("Không tồn tại")) {
          continue;
        }

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

    // ✅ Fetch all invoices month by month
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
      message: `✅ Danh sách ${invoiceQueryTypeNames[queryType]} hoàn tất! (${
        invoices.length
      } hóa đơn)`,
    });

    await this._attachInvoiceDetails(invoices, queryType);
    return invoices;
  }

  /** Fetch invoice details with concurrency control */
  private async _attachInvoiceDetails(
    invoices: any[],
    queryType: InvoiceQueryType,
  ) {
    const concurrency = 5; // tune based on API limits
    let index = 0;
    const total = invoices.length;

    const results: any[] = [];
    const workers = Array.from({ length: concurrency }, async () => {
      while (index < invoices.length) {
        const i = index++;
        const invoice = invoices[i];

        this._log({
          id: `detail-${invoice.id}`,
          message: `🚧 Chi tiết SP hóa đơn ${invoice.khhdon}/${invoice.shdon} (${index}/${total})`,
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
            message: `✅ Chi tiết SP hóa đơn ${invoice.khhdon}/${invoice.shdon} (${index}/${total})`,
          });
        } catch (err) {
          console.error(
            `Failed to fetch detail for invoice ${invoice.id}`,
            err,
          );
          invoice.detail = null; // mark as missing
          this._log({
            id: `detail-${invoice.id}`,
            message: `❌ Chi tiết hóa đơn ${invoice.khhdon} thất bại (${index}/${total})`,
            status: "failed",
          });
        }

        results[i] = invoice;
      }
    });

    await Promise.all(workers);
    this._log({ message: "✅ Hoàn tất tải chi tiết hóa đơn" });
    return results;
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
