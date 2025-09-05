import { EventEmitter } from "events";
import * as XLSX from "xlsx";
import {
  FetchInvoiceOptions,
  InvoiceQueryType,
  InvoiceType,
  fetchAllInvoices,
  fetchInvoiceDetail,
} from "@/lib/download/hoadon-api";
import { createInvoicesSheet } from "@/lib/download/exel";

export type ExportInput = {
  fromDate: Date;
  toDate: Date;
  invoiceType: InvoiceType;
  filter: FetchInvoiceOptions;
};

export type InvoiceExportLog = {
  id?: string; // can be undefined
  message: string;
  status?: string;
};

export type InvoiceItem = any;

export class InvoiceExportManager extends EventEmitter {
  private logs = new Map<string, InvoiceExportLog>();

  constructor(private jwt: string) {
    super();
  }

  private _log(log: InvoiceExportLog) {
    const id = log.id ?? `${Date.now()}-${Math.random()}`; // fallback unique id
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
      XLSX.writeFileXLSX(wb, "hoa-don.xlsx");
      this._log({
        message: "✅ Hoàn tất tạo file Excel",
        id: "excel",
      });
    } catch (err) {
      console.error("Export failed:", err);
      this._log({
        id: "result",
        message: "❌ Lỗi trong quá trình tải dữ liệu",
        status: "failed",
      });
    }
  }

  private async fetchInvoices(input: ExportInput, queryType: InvoiceQueryType) {
    this._log({
      id: `list-${queryType}`,
      message:
        queryType === "query"
          ? "🔄 Đang tải danh sách hóa đơn điện tử..."
          : "🔄 Đang tải danh sách hóa đơn có mã từ máy tính tiền...",
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
      message: `✅ Danh sách ${
        queryType === "query"
          ? "hóa đơn điện tử"
          : "hóa đơn có mã từ máy tính tiền"
      } hoàn tất! (${invoices.length} hóa đơn)`,
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
