import ExcelJS from "exceljs";
import {
  invoiceCheckResultTitlte,
  invoiceStatusTitle,
  invoiceItemTypeTitle,
} from "./format";
import { InvoiceType } from "./hoadon-api";
import {
  getLookupProvider,
  type DownloadParams,
} from "../hoadongoc/downloader";

const moneyFormat = "#,##0";

/**
 * ExcelJS does not handle timezones well. Dates are written as UTC.
 * This function converts a UTC date string to a Date object that, when rendered by ExcelJS,
 * will show the correct date for the Vietnam timezone (UTC+7).
 * @param dateString ISO date string in UTC
 * @returns A Date object adjusted for Vietnam timezone.
 */
function toVietnamDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }
  const date = new Date(dateString);
  // Adjust for Vietnam timezone (UTC+7) by adding 7 hours
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
}

const getMainSectionHeader = () => {
  // invoiceType removed
  const headers = [
    "STT",
    "KÝ HIỆU MẪU SỐ",
    "KÝ HIỆU HÓA ĐƠN",
    "SỐ HÓA ĐƠN",
    "NGÀY LẬP",
    "MST NGƯỜI BÁN",
    "TÊN NGƯỜI BÁN",
    "ĐỊA CHỈ NGƯỜI BÁN",
    "MST NGƯỜI MUA",
    "TÊN NGƯỜI MUA",
    "ĐỊA CHỈ NGƯỜI MUA",
    "TỔNG TIỀN CHƯA THUẾ",
    "TỔNG TIỀN THUẾ",
    "TỔNG TIỀN CHIẾT KHẤU THƯƠNG MẠI",
    "TỔNG TIỀN PHÍ",
    "TỔNG TIỀN THANH TOÁN",
    "ĐƠN VỊ TIỀN TỆ",
    "TỶ GIÁ",
    "TRẠNG THÁI HÓA ĐƠN",
    "KẾT QUẢ KIỂM TRA HÓA ĐƠN",
  ];
  return headers;
};

const detailSectionHeader = [
  "TÍNH CHẤT",
  "TÊN HÀNG HÓA, DỊCH VỤ",
  "ĐƠN VỊ TÍNH",
  "SỐ LƯỢNG",
  "ĐƠN GIÁ",
  "THUẾ SUẤT",
  "THÀNH TIỀN",
  "TIỀN THUẾ",
];

export function createCombinedInvoicesSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  invoices: any[],
  invoicesFromCashRegister: any[],
  invoiceType: InvoiceType,
) {
  const mainSheet = workbook.addWorksheet(sheetName);

  const mainSectionHeader = getMainSectionHeader(); // Removed invoiceType argument
  const combinedHeader = [
    "LOẠI HÓA ĐƠN",
    ...mainSectionHeader,
    "Link tra cứu",
    "Mã tra cứu",
  ];
  // Add headers
  const headerRow = mainSheet.addRow(combinedHeader);
  headerRow.font = { bold: true };

  // Freeze header row
  mainSheet.views = [{ state: "frozen", ySplit: 1 }];

  // Add data
  let rowIndex = 1;
  const allInvoices = [
    ...invoices.map((i) => ({ ...i, type: "HĐ điện tử" })),
    ...invoicesFromCashRegister.map((i) => ({
      ...i,
      type: "HĐ từ máy tính tiền",
    })),
  ];

  allInvoices.forEach((invoice) => {
    rowIndex++;
    const row = mainSheet.getRow(rowIndex);
    row.getCell(1).value = invoice.type;
    row.getCell(2).value = rowIndex - 1;
    row.getCell(3).value = invoice.hdon;
    row.getCell(4).value = invoice.khhdon;
    row.getCell(5).value = invoice.shdon;
    row.getCell(6).value = toVietnamDate(invoice.tdlap); // NGÀY LẬP
    row.getCell(7).value = invoice.nbmst; // MST NGƯỜI BÁN
    row.getCell(8).value = invoice.nbten; // TÊN NGƯỜI BÁN
    row.getCell(9).value = invoice.nbdchi; // ĐỊA CHỈ NGƯỜI BÁN
    row.getCell(10).value = invoice.nmmst; // MST NGƯỜI MUA
    row.getCell(11).value = invoice.nmten; // TÊN NGƯỜI MUA
    row.getCell(12).value = invoice.nmdchi; // ĐỊA CHỈ NGƯỜI MUA
    row.getCell(13).value = invoice.tgtcthue; // TỔNG TIỀN CHƯA THUẾ
    row.getCell(14).value = invoice.tgtthue; // TỔNG TIỀN THUẾ
    row.getCell(15).value = invoice.ttcktmai; // TỔNG TIỀN CHIẾT KHẤU THƯƠNG MẠI
    row.getCell(16).value = invoice.tgtphi; // TỔNG TIỀN PHÍ
    row.getCell(17).value = invoice.tgtttbso; // TỔNG TIỀN THANH TOÁN
    row.getCell(18).value = invoice.dvtte; // ĐƠN VỊ TIỀN TỆ
    row.getCell(19).value = invoice.tgia || 1; // TỶ GIÁ
    row.getCell(20).value = invoiceStatusTitle[invoice.tthai] ?? invoice.tthai; // TRẠNG THÁI HÓA ĐƠN
    row.getCell(21).value =
      invoiceCheckResultTitlte[invoice.ttxly] ?? invoice.ttxly; // KẾT QUẢ KIỂM TRA HÓA ĐƠN

    const provider = getLookupProvider(invoice as DownloadParams);
    if (provider) {
      const lookupUrl = provider.lookupUrl(invoice as DownloadParams);
      if (lookupUrl) {
        row.getCell(22).value = {
          text: lookupUrl,
          hyperlink: lookupUrl,
        };
      }
      row.getCell(23).value = provider.lookupInfo(invoice as DownloadParams);
    }
  });

  // Formatting
  mainSheet.columns.forEach((column, i) => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength > 60 ? 60 : maxLength;
  });

  mainSheet.getColumn(6).numFmt = "dd/mm/yyyy";
  mainSheet.getColumn(13).numFmt = moneyFormat;
  mainSheet.getColumn(14).numFmt = moneyFormat;
  mainSheet.getColumn(15).numFmt = moneyFormat;
  mainSheet.getColumn(16).numFmt = moneyFormat;
  mainSheet.getColumn(17).numFmt = moneyFormat;
}

export function createInvoicesSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  invoices: any[],
  invoiceType: InvoiceType,
) {
  const mainSheet = workbook.addWorksheet(sheetName);
  const mainSectionHeader = getMainSectionHeader(); // Removed invoiceType argument

  // Add headers
  const headerRow = mainSheet.addRow([
    ...mainSectionHeader,
    ...detailSectionHeader,
  ]);
  headerRow.font = { bold: true };

  // Freeze header row
  mainSheet.views = [{ state: "frozen", ySplit: 1 }];

  // Add data
  let currentRowIndex = 2;
  invoices.forEach((invoice, index) => {
    addTienThue(invoice);
    const detailRows = invoice.detail?.hdhhdvu?.length || 1;
    for (let i = 0; i < detailRows; i++) {
      const row = mainSheet.getRow(currentRowIndex + i);
      if (i === 0) {
        // Main invoice data
        row.getCell(1).value = index + 1;
        row.getCell(2).value = invoice.hdon;
        row.getCell(3).value = invoice.khhdon;
        row.getCell(4).value = invoice.shdon;
        row.getCell(5).value = toVietnamDate(invoice.tdlap); // NGÀY LẬP
        row.getCell(6).value = invoice.nbmst; // MST NGƯỜI BÁN
        row.getCell(7).value = invoice.nbten; // TÊN NGƯỜI BÁN
        row.getCell(8).value = invoice.nbdchi; // ĐỊA CHỈ NGƯỜI BÁN
        row.getCell(9).value = invoice.nmmst; // MST NGƯỜI MUA
        row.getCell(10).value = invoice.nmten; // TÊN NGƯỜI MUA
        row.getCell(11).value = invoice.nmdchi; // ĐỊA CHỈ NGƯỜI MUA
        row.getCell(12).value = invoice.tgtcthue; // TỔNG TIỀN CHƯA THUẾ
        row.getCell(13).value = invoice.tgtthue; // TỔNG TIỀN THUẾ
        row.getCell(14).value = invoice.ttcktmai; // TỔNG TIỀN CHIẾT KHẤU THƯƠNG MẠI
        row.getCell(15).value = invoice.tgtphi; // TỔNG TIỀN PHÍ
        row.getCell(16).value = invoice.tgtttbso; // TỔNG TIỀN THANH TOÁN
        row.getCell(17).value = invoice.dvtte; // ĐƠN VỊ TIỀN TỆ
        row.getCell(18).value = invoice.tgia || 1; // TỶ GIÁ
        row.getCell(19).value =
          invoiceStatusTitle[invoice.tthai] ?? invoice.tthai; // TRẠNG THÁI HÓA ĐƠN
        row.getCell(20).value =
          invoiceCheckResultTitlte[invoice.ttxly] ?? invoice.ttxly; // KẾT QUẢ KIỂM TRA HÓA ĐƠN
      }

      // Detail invoice data
      if (invoice.detail?.hdhhdvu && invoice.detail.hdhhdvu[i]) {
        const item = invoice.detail.hdhhdvu[i];
        row.getCell(21).value = invoiceItemTypeTitle[item.tchat]; // TÍNH CHẤT
        row.getCell(22).value = item.ten; // TÊN HÀNG HÓA, DỊCH VỤ
        row.getCell(23).value = item.dvtinh; // ĐƠN VỊ TÍNH
        row.getCell(24).value = item.sluong; // SỐ LƯỢNG
        row.getCell(25).value = item.dgia; // ĐƠN GIÁ
        row.getCell(26).value = item.tsuat; // THUẾ SUẤT
        row.getCell(27).value = item.thtien; // THÀNH TIỀN
        row.getCell(28).value = item.tien_thue; // TIỀN THUẾ
      }
    }

    // Merge cells
    if (detailRows > 1) {
      for (let col = 1; col <= mainSectionHeader.length; col++) {
        mainSheet.mergeCells(
          currentRowIndex,
          col,
          currentRowIndex + detailRows - 1,
          col,
        );

        // Get top-left cell of merged range
        const cell = mainSheet.getCell(currentRowIndex, col);

        // Only center vertically (middle of the merged rows)
        cell.alignment = { vertical: "middle" };
      }
    }

    currentRowIndex += detailRows;
  });

  // Formatting
  mainSheet.columns.forEach((column, i) => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength > 60 ? 60 : maxLength;
  });

  mainSheet.getColumn(5).numFmt = "dd/mm/yyyy"; // NGÀY LẬP
  mainSheet.getColumn(12).numFmt = moneyFormat; // TỔNG TIỀN CHƯA THUẾ
  mainSheet.getColumn(13).numFmt = moneyFormat; // TỔNG TIỀN THUẾ
  mainSheet.getColumn(14).numFmt = moneyFormat; // TỔNG TIỀN CHIẾT KHẤU THƯƠNG MẠI
  mainSheet.getColumn(15).numFmt = moneyFormat; // TỔNG TIỀN PHÍ
  mainSheet.getColumn(16).numFmt = moneyFormat; // TỔNG TIỀN THANH TOÁN
  mainSheet.getColumn(25).numFmt = moneyFormat; // ĐƠN GIÁ
  mainSheet.getColumn(26).numFmt = "0.00%"; // THUẾ SUẤT
  mainSheet.getColumn(27).numFmt = moneyFormat; // THÀNH TIỀN
  mainSheet.getColumn(28).numFmt = moneyFormat; // TIỀN THUẾ
}

export async function excelToBlob(workbook: ExcelJS.Workbook): Promise<Blob> {
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function addTienThue(invoice: any) {
  // add calculated 'Tiền thuế'
  invoice.detail?.hdhhdvu?.forEach((item: any) => {
    item["tien_thue"] = item["thtien"] * item["tsuat"];
  });

  return;
}

// DS sản phẩm
export function createProductsSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  products: any[],
) {
  const productsSheet = workbook.addWorksheet(sheetName);

  const header = [
    "STT",
    "KÝ HIỆU MẪU SỐ",
    "KÝ HIỆU HÓA ĐƠN",
    "SỐ HÓA ĐƠN",
    "NGÀY LẬP",
    "MST NGƯỜI BÁN",
    "TÊN NGƯỜI BÁN",
    "ĐỊA CHỈ NGƯỜI BÁN",
    "MST NGƯỜI MUA",
    "TÊN NGƯỜI MUA",
    "ĐỊA CHỈ NGƯỜI MUA",
    "ĐƠN VỊ TIỀN TỆ",
    "TỶ GIÁ",
    "TÍNH CHẤT",
    "TÊN HÀNG HÓA, DỊCH VỤ",
    "ĐƠN VỊ TÍNH",
    "SỐ LƯỢNG",
    "ĐƠN GIÁ",
    "THUẾ SUẤT",
    "THÀNH TIỀN",
    "TIỀN THUẾ",
  ];

  productsSheet.addRow(header).font = { bold: true };

  products.forEach((product, i) => {
    productsSheet.addRow([
      i + 1,
      product.invoice.hdon,
      product.invoice.khhdon,
      product.invoice.shdon,
      toVietnamDate(product.invoice.tdlap),
      product.invoice.nbmst,
      product.invoice.nbten,
      product.invoice.nbdchi,
      product.invoice.nmmst,
      product.invoice.nmten,
      product.invoice.nmdchi,
      product.invoice.dvtte,
      product.invoice.tgia,
      product.tchat,
      product.ten,
      product.dvtinh,
      product.sluong,
      product.dgia,
      product.tsuat,
      product.thtien,
      product.tien_thue,
    ]);
  });

  productsSheet.columns.forEach((column, i) => {
    let maxLength = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength > 60 ? 60 : maxLength;
  });

  productsSheet.getColumn("E").numFmt = "dd/mm/yyyy";
  productsSheet.getColumn("R").numFmt = moneyFormat;
  productsSheet.getColumn("S").numFmt = "0.00%";
  productsSheet.getColumn("T").numFmt = moneyFormat;
  productsSheet.getColumn("U").numFmt = moneyFormat;

  productsSheet.views = [{ state: "frozen", ySplit: 1 }];
}

// Bảng kê hóa, chứng từ hàng hóa, dịch vụ mua vào. (01-1/HT TT80)
export function createBK011Sheet(workbook: ExcelJS.Workbook, products: any[]) {
  const ws = workbook.addWorksheet("BK_mua_vào_TT80");
  //
  // ===== HEADER SECTION =====
  //
  ws.addRow([]);
  ws.mergeCells("A2:O2");
  ws.getCell("A2").value =
    "BẢNG KÊ HOÁ ĐƠN, CHỨNG TỪ HÀNG HOÁ, DỊCH VỤ MUA VÀO";
  ws.getCell("A2").font = { bold: true, size: 14 };
  ws.getCell("A2").alignment = { horizontal: "center" };

  //
  // ===== TABLE SECTION =====
  //
  const tableStartRow = (ws.lastRow?.number ?? 0) + 1;

  ws.addTable({
    name: "Products",
    ref: `A${tableStartRow}`,
    headerRow: true,
    totalsRow: true,
    style: {
      theme: "TableStyleLight1",
    },
    columns: [
      { name: "STT", totalsRowLabel: "Tổng" },
      { name: "Mẫu số" },
      { name: "Ký hiệu" },
      { name: "Số" },
      { name: "Ngày, tháng, năm" },
      { name: "Tên người bán" },
      { name: "Mã số thuế người bán" },
      { name: "Tên hàng hóa, dịch vụ" },
      { name: "Đơn vị tính" },
      { name: "Số lượng" },
      { name: "Đơn giá" },
      { name: "Giá trị HHDV mua vào chưa có thuế GTGT" },
      { name: "Thuế suất (%)" },
      { name: "Tiền thuế GTGT", totalsRowFunction: "sum" },
      { name: "Ghi chú" },
    ],
    rows: products.map((p, i) => [
      i + 1,
      p.invoice.hdon + "",
      p.invoice.khhdon,
      p.invoice.shdon + "",
      toVietnamDate(p.invoice.tdlap),
      p.invoice.nbten,
      p.invoice.nbmst,
      //
      p.ten,
      p.dvtinh,
      p.sluong,
      p.dgia,
      p.thtien,
      p.tsuat,
      p.tien_thue,
      "",
    ]),
  });

  //
  // ===== COLUMN WIDTHS (aligned with table width) =====
  //
  const colWidths = [6, 10, 10, 8, 14, 25, 18, 25, 10, 10, 12, 18, 10, 14, 10];
  colWidths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  //
  // ===== FORMATTING CELLS =====
  //
  const firstDataRow = tableStartRow + 1;
  const lastDataRow = firstDataRow + products.length - 1;

  for (let i = firstDataRow; i <= lastDataRow; i++) {
    ws.getCell(`K${i}`).numFmt = moneyFormat;
    ws.getCell(`L${i}`).numFmt = moneyFormat;
    ws.getCell(`M${i}`).numFmt = "0.00%";
    ws.getCell(`N${i}`).numFmt = moneyFormat;
  }
  ws.getCell(`N${lastDataRow + 1}`).numFmt = moneyFormat; // total row
}
