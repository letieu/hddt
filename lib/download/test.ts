import { createBK011Sheet } from "./exel";
import * as XLSX from "xlsx";

const sheet = createBK011Sheet([]);
const ws = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(ws, sheet, "Sheet1");
XLSX.writeFile(ws, "test.xlsx");
