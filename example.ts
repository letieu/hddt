import { fileToListTaxId } from "./sheet";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const crawlUrl = "https://mst.letieu.online";
//const crawlUrl = "http://localhost:3000";

const form = document.getElementById("mst-form") as HTMLFormElement;

const fileInput = document.getElementById("mst-input-file") as HTMLInputElement;
const typeInput = document.getElementById("mst-input-type") as HTMLInputElement;
const isAllInput = document.getElementById("mst-input-isAll") as HTMLInputElement;

const downloadBtn = document.getElementById(
  "mst-download-btn"
) as HTMLButtonElement;

form.onsubmit = async (e) => {
  e.preventDefault();

  const selectedFile = fileInput!.files?.[0];
  const selectedType = typeInput.value;
  const isAll = isAllInput.value === 'true';

  if (!selectedFile) {
    alert("Vui lòng upload file");
    return;
  }

  const taxIds = await fileToListTaxId(selectedFile);

  downloadBtn.textContent = "Downloading ...";
  downloadBtn.disabled = true;

  try {
    const crawlData = await crawl(taxIds, +selectedType, isAll);
    if (crawlData?.length === 0) {
      alert("Không tìm thấy dữ liệu");
      return;
    }

    const zipFile = await createZip(crawlData);
    saveAs(zipFile, `mst.zip`);
  } catch (e: any) {
    alert(e);
  } finally {
    downloadBtn.textContent = "Download";
    downloadBtn.disabled = false;
  }
};

async function crawl(taxIds: string[], type: number, isAll: boolean) {
  const res = await fetch(crawlUrl, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      taxIds: taxIds,
      type: type,
      isAll: isAll,
    }),
  });

  if (!res.ok) {
    const errorDetail = await res.text().catch(() => "");
    alert(errorDetail || "Server error");
    return;
  }

  const resData = await res.json();
  return resData;
}

const createExcelWb = (data: any[]) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return wb;
};

function excelToBlob(workbook: XLSX.WorkBook) {
  var wopts: XLSX.WritingOptions = {
    bookType: "xlsx",
    bookSST: false,
    type: "array",
  };
  const output = XLSX.write(workbook, wopts);
  return new Blob([output], { type: "application/octet-stream" });
}

async function createZip(data: any) {
  const zip = new JSZip();

  const fileName = `mst.xlsx`;
  const workbook = createExcelWb(data);
  const blob = excelToBlob(workbook);
  zip.file(fileName, blob);

  return zip.generateAsync({ type: "blob" });
}
