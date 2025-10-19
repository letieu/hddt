import ExcelJS from "exceljs";
import {
  invoiceCheckResultTitlte,
  invoiceStatusTitle,
  invoiceItemTypeTitle,
} from "./format";
import { InvoiceType } from "./hoadon-api";

const mainSectionHeader = [
  "STT",
  "KÝ HIỆU MẪU SỐ",
  "KÝ HIỆU HÓA ĐƠN",
  "SỐ HÓA ĐƠN",
  "NGÀY LẬP",
  "MST NGƯỜI MUA/NHẬN",
  "TÊN NGƯỜI MUA/NHẬN",
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

export function createInvoicesSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  invoices: any[],
  invoiceType: InvoiceType,
) {
  const mainSheet = workbook.addWorksheet(sheetName);

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
        row.getCell(5).value = new Date(invoice.tdlap);
        row.getCell(6).value =
          invoiceType === "purchase" ? invoice.nbmst : invoice.nmmst;
        row.getCell(7).value =
          invoiceType === "purchase" ? invoice.nbten : invoice.nmten;
        row.getCell(8).value = invoice.tgtcthue;
        row.getCell(9).value = invoice.tgtthue;
        row.getCell(10).value = invoice.ttcktmai;
        row.getCell(11).value = invoice.tgtphi;
        row.getCell(12).value = invoice.tgtttbso;
        row.getCell(13).value = invoice.dvtte;
        row.getCell(14).value = invoice.tgia || 1;
        row.getCell(15).value =
          invoiceStatusTitle[invoice.tthai] ?? invoice.tthai;
        row.getCell(16).value =
          invoiceCheckResultTitlte[invoice.ttxly] ?? invoice.ttxly;
      }

      // Detail invoice data
      if (invoice.detail?.hdhhdvu && invoice.detail.hdhhdvu[i]) {
        const item = invoice.detail.hdhhdvu[i];
        row.getCell(17).value = invoiceItemTypeTitle[item.tchat];
        row.getCell(18).value = item.ten;
        row.getCell(19).value = item.dvtinh;
        row.getCell(20).value = item.sluong;
        row.getCell(21).value = item.dgia;
        row.getCell(22).value = item.tsuat;
        row.getCell(23).value = item.thtien;
        row.getCell(24).value = item.tien_thue;
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

  mainSheet.getColumn(5).numFmt = "dd/mm/yyyy";
  mainSheet.getColumn(8).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(9).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(10).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(11).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(12).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(21).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(22).numFmt = "0.00%";
  mainSheet.getColumn(23).numFmt = '#,##0 "đ"';
  mainSheet.getColumn(24).numFmt = '#,##0.00 "đ"';
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
    "MST NGƯỜI MUA",
    "TÊN NGƯỜI MUA",
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
      product.invoice.tdlap,
      product.invoice.nmmst,
      product.invoice.nmten,
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
  productsSheet.getColumn("L").numFmt = "#,##0";
  productsSheet.getColumn("P").numFmt = '#,##0 "đ"';
  productsSheet.getColumn("Q").numFmt = '#,##0.00 "đ"';

  productsSheet.getColumn("O").numFmt = "0.00%";

  productsSheet.views = [{ state: "frozen", ySplit: 1 }];
}

// Bảng kê hóa, chứng từ hàng hóa, dịch vụ mua vào. (01-1/HT TT80)
export function createBK011Sheet(workbook: ExcelJS.Workbook, invoices: any[]) {
  const ws = workbook.addWorksheet("01-1/HT");

  ws.addRow([""]);
  ws.addRow(["BẢNG KÊ HOÁ ĐƠN, CHỨNG TỪ HÀNG HOÁ, DỊCH VỤ MUA VÀO"]);
  ws.addRow([
    "(Kèm theo Giấy đề nghị hoàn trả khoản thu NSNN số ... ngày ... tháng... năm...)",
  ]);
  ws.addRow(["[01] Kỳ đề nghị hoàn thuế: Từ kỳ...... đến kỳ......"]);
  ws.addRow(["[02] Mã số thuế:"]);
  ws.addRow(["[04] Tên đại lý nộp thuế:"]);
  ws.addRow(["[05] Mã số thuế:"]);

  ws.getCell("A2").font = { bold: true };
}
