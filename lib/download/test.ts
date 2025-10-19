import { createBK011Sheet } from "./exel";
import ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
createBK011Sheet(workbook, []);

workbook.xlsx.writeFile("test.xlsx");
