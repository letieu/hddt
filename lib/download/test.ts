import { createBK011Sheet } from "./exel";
import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
createBK011Sheet(workbook, [
  {
    hdon: "12345678",
    khhdon: "12345678",
    shdon: "12345678",
    tdlap: "2023-01-01",
    nbten: "12345678",
    nbmst: "12345678",
    ten: "12345678",
    dvtinh: "12345678",
    sluong: "12345678",
    dgia: "12345678",
    thtien: "12345678",
    tsuat: "12345678",
    tien_thue: "12345678",
  },
]);

workbook.xlsx.writeFile("test.xlsx");
