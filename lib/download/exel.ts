import * as XLSX from "xlsx";
import {
  invoiceCheckResultTitlte,
  invoiceItemTypeTitle,
  invoiceStatusTitle,
} from "./format";
import { InvoiceType } from "./hoadon-api";

const mainSectionHeader = [
  "STT",
  "Ký hiệu mẫu số",
  "Ký hiệu hóa đơn",
  "Số hóa đơn",
  "Ngày lập",
  "MST người mua/nhận",
  "Tên người mua/nhận",
  "Tổng tiền chưa thuế",
  "Tổng tiền thuế",
  "Tổng tiền chiết khấu thương mại",
  "Tổng tiền phí",
  "Tổng tiền thanh toán",
  "Đơn vị tiền tệ",
  "Tỷ giá",
  "Trạng thái hóa đơn",
  "Kết quả kiểm tra hóa đơn",
];

const detailSectionHeader = [
  "Tính chất",
  "Tên hàng hóa, dịch vụ",
  "Đơn vị tính",
  "Số lượng",
  "Đơn giá",
  "Thuế suất",
  "Thành tiền",
  "Tiền thuế",
];

export async function createInvoicesSheet(
  invoices: any[],
  invoiceType: InvoiceType,
  mergeDetails: boolean,
): Promise<{ mainSheet: XLSX.WorkSheet; products?: any[] }> {
  if (mergeDetails) {
    const sheetData = createSheetData(invoices, invoiceType);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    formatCells(ws, sheetData.length, true);
    ws["!cols"] = fitToColumn(sheetData);
    if (ws["!cols"]?.[4]) ws["!cols"]![4] = { wch: 12 };
    mergeCells(ws, invoices);
    return { mainSheet: ws };
  } else {
    const mainSheetData = [mainSectionHeader];
    const products: any[] = [];
    invoices.forEach((invoice, index) => {
      const mainRow = [
        index + 1,
        invoice.hdon,
        invoice.khhdon,
        `${invoice.shdon}`,
        new Date(invoice.tdlap),
        invoiceType == "purchase" ? invoice.nbmst : invoice.nmmst,
        invoiceType == "purchase" ? invoice.nbten : invoice.nmten,
        invoice.tgtcthue,
        invoice.tgtthue,
        invoice.ttcktmai,
        invoice.tgtphi,
        invoice.tgtttbso,
        invoice.dvtte,
        invoice.tgia || 1,
        invoiceStatusTitle[invoice.tthai] ?? invoice.tthai,
        invoiceCheckResultTitlte[invoice.ttxly] ?? invoice.ttxly,
      ];
      mainSheetData.push(mainRow);
      addTienThue(invoice);
      invoice.detail?.hdhhdvu?.forEach((item: any) => {
        products.push([
          invoice.khhdon,
          `${invoice.shdon}`,
          new Date(invoice.tdlap),
          invoiceItemTypeTitle[item["tchat"]],
          item["ten"],
          item["dvtinh"],
          item["sluong"],
          item["dgia"],
          item["tsuat"],
          item["thtien"],
          item["tien_thue"],
        ]);
      });
    });
    const ws = XLSX.utils.aoa_to_sheet(mainSheetData);
    formatCells(ws, mainSheetData.length, false); // This will only format the main sheet columns, which is fine.
    ws["!cols"] = fitToColumn(mainSheetData);
    if (ws["!cols"]?.[4]) ws["!cols"]![4] = { wch: 12 };
    return { mainSheet: ws, products };
  }
}

function createSheetData(invoices: any[], invoiceType: InvoiceType) {
  const header = [...mainSectionHeader, ...detailSectionHeader];

  const data = [];
  data.push(header);

  invoices.forEach((invoice, index) => {
    const rows = invoiceToRows(invoice, index, invoiceType);
    rows.forEach((r) => data.push(r));
  });

  return data;
}

export function excelToBlob(workbook: XLSX.WorkBook) {
  // write to blob
  var wopts: XLSX.WritingOptions = {
    bookType: "xlsx",
    bookSST: false,
    type: "array",
  };
  const output = XLSX.write(workbook, wopts);
  return new Blob([output], { type: "application/octet-stream" });
}

function invoiceToRows(invoice: any, index: number, invoiceType: InvoiceType) {
  const mainRow = [
    index + 1, // STT
    invoice.hdon, // Ký hiệu mẫu số
    invoice.khhdon, // Ký hiệu hóa đơn
    `${invoice.shdon}`, // Số hóa đơn
    new Date(invoice.tdlap), // Ngày lập
    invoiceType == "purchase" ? invoice.nbmst : invoice.nmmst, // MST người mua/nhận
    invoiceType == "purchase" ? invoice.nbten : invoice.nmten, // Tên người mua/nhận
    invoice.tgtcthue, // Tổng tiền chưa thuế
    invoice.tgtthue, // Tổng tiền thuế
    invoice.ttcktmai, // Tổng tiền chiết khấu thương mại
    invoice.tgtphi, // Tổng tiền phí
    invoice.tgtttbso, // Tổng tiền thanh toán
    invoice.dvtte, // Đơn vị tiền tệ
    invoice.tgia || 1, // Tỷ giá
    invoiceStatusTitle[invoice.tthai] ?? invoice.tthai, // Trạng thái hóa đơn
    invoiceCheckResultTitlte[invoice.ttxly] ?? invoice.ttxly, // Kết quả kiểm tra hóa đơn
  ];

  const emptyPrefix = Array(mainRow.length);

  const rows: any[][] = [];

  addTienThue(invoice);

  invoice.detail?.hdhhdvu?.forEach((item: any, itemIndex: number) => {
    const prefix = itemIndex === 0 ? mainRow : emptyPrefix;

    rows.push([
      ...prefix,
      invoiceItemTypeTitle[item["tchat"]], // Tính chất
      item["ten"], // Tên hàng hóa, dịch vụ
      item["dvtinh"], // Đơn vị tính
      item["sluong"], // Số lượng
      item["dgia"], // Đơn giá
      item["tsuat"], // Thuế suất
      item["thtien"], // Thành tiền
      item["tien_thue"], // Tiền thuế
    ]);
  });

  return rows;
}

function fitToColumn(arrayOfArray: any) {
  // get maximum character of each column
  return arrayOfArray[0].map((_: any, i: number) => ({
    wch: Math.max(
      ...arrayOfArray.map((a2: any) =>
        a2[i] ? Math.min(a2[i].toString().length, 60) : 0,
      ),
    ),
  }));
}

function formatCells(ws: XLSX.WorkSheet, totalRows: number, mergeDetails: boolean) {
  for (let i = 0; i < totalRows; i++) {
    const row = i + 2;
    if (ws[`E${row}`]) ws[`E${row}`].z = "dd/mm/yyyy";
    if (ws[`H${row}`]) ws[`H${row}`].z = `#,### "đ"`;
    if (ws[`I${row}`]) ws[`I${row}`].z = `#,### "đ"`;
    if (ws[`J${row}`]) ws[`J${row}`].z = `#,### "đ"`;
    if (ws[`K${row}`]) ws[`K${row}`].z = `#,### "đ"`;
    if (ws[`L${row}`]) ws[`L${row}`].z = `#,### "đ"`;
    if (mergeDetails) {
      if (ws[`U${row}`]) ws[`U${row}`].z = `#,### "đ"`;
      if (ws[`V${row}`]) ws[`V${row}`].z = `0.00%`;
      if (ws[`W${row}`]) ws[`W${row}`].z = `#,### "đ"`;
      if (ws[`X${row}`]) ws[`X${row}`].z = `#,##0.00 "đ"`;
    }
  }
}

function mergeCells(ws: XLSX.WorkSheet, invoices: any[]) {
  const merge = [];
  const totalMainCols = mainSectionHeader.length;
  let currentRow = 1;
  for (let i = 0; i < invoices.length; i++) {
    const totalDetailRows = invoices[i].detail?.hdhhdvu?.length ?? 0;
    for (let col = 0; col < totalMainCols; col++) {
      const start = { r: currentRow, c: col };
      const end = { r: currentRow + totalDetailRows - 1, c: col };
      merge.push({ s: start, e: end });
    }
    currentRow += totalDetailRows;
  }

  ws["!merges"] = merge;
}

function addTienThue(invoice: any) {
  // add calculated 'Tiền thuế'
  invoice.detail?.hdhhdvu?.forEach((item: any) => {
    item["tien_thue"] = item["thtien"] * item["tsuat"];
  });

  return;

  // adjust to make sure sum(Tiền thuế) equal to Tổng tiền thuế
  const tongTienThue = invoice.tgtthue;
  const calcuatedTotal = invoice.detail.hdhhdvu.reduce(
    (total: number, item: any) => total + item["tien_thue"],
    0,
  );
  const diff = calcuatedTotal - tongTienThue;

  if (Math.abs(diff) <= 0.0001) return;

  const adjustIndex = (invoice.detail.hdhhdvu as any[]).findIndex(
    (item) => item["tien_thue"] > Math.abs(diff),
  );

  if (adjustIndex != -1) {
    console.log(`adjust index: ${adjustIndex}, diff: ${diff}`);
    invoice.detail.hdhhdvu[adjustIndex]["tien_thue"] += diff;
  }
}

export function createProductsSheet(products: any[]) {
  const header = [
    "Ký hiệu hóa đơn",
    "Số hóa đơn",
    "Ngày lập",
    "Tính chất",
    "Tên hàng hóa, dịch vụ",
    "Đơn vị tính",
    "Số lượng",
    "Đơn giá",
    "Thuế suất",
    "Thành tiền",
    "Tiền thuế",
  ];
  const sheetData = [header, ...products];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = fitToColumn(sheetData);
  // Add formatting for product sheet
  for (let i = 0; i < products.length; i++) {
    const row = i + 2;
    if (ws[`C${row}`]) ws[`C${row}`].z = "dd/mm/yyyy";
    if (ws[`G${row}`]) ws[`G${row}`].z = `#,###`;
    if (ws[`H${row}`]) ws[`H${row}`].z = `#,### "đ"`;
    if (ws[`I${row}`]) ws[`I${row}`].z = `0.00%`;
    if (ws[`J${row}`]) ws[`J${row}`].z = `#,### "đ"`;
    if (ws[`K${row}`]) ws[`K${row}`].z = `#,##0.00 "đ"`;
  }
  return ws;
}
