import { useState } from "react";
import { HddtFormInput } from "../downloader/hddt-form";
import { fetchAllInvoices, fetchProfile } from "@/lib/download/hoadon-api";
import { LogEntry, Invoice, queryTypeNames } from "@/lib/hoadongoc/types";

export function useHoadonDientuSearch(
  addLog: (status: LogEntry["status"], message: string) => void,
  onComplete: (invoices: Invoice[]) => void,
) {
  const [formInput, setFormInput] = useState<HddtFormInput | null>(null);
  const [openCaptcha, setOpenCaptcha] = useState(false);
  const [searchState, setSearchState] = useState<
    "idle" | "searching" | "failed" | "success"
  >("idle");

  const handleSearch = async (data: HddtFormInput) => {
    setFormInput(data);
    setSearchState("searching");

    addLog("info", "Bắt đầu tìm kiếm...");

    let currentJwt = localStorage.getItem(`jwt_${data.credential.username}`);
    if (currentJwt) {
      try {
        await fetchProfile(currentJwt);
        await doSearch(currentJwt, data);
      } catch (e) {
        addLog("info", "JWT hết hạn hoặc không hợp lệ, yêu cầu captcha.");
        setOpenCaptcha(true);
      }
      return;
    }

    addLog("info", "Yêu cầu captcha để lấy token.");
    setOpenCaptcha(true);
  };

  async function onLoginComplete(jwt: string) {
    if (!formInput) return;

    localStorage.setItem(`jwt_${formInput.credential.username}`, jwt);
    setOpenCaptcha(false);
    doSearch(jwt, formInput);
  }

  async function doSearch(jwt: string, data: HddtFormInput) {
    setSearchState("searching");
    addLog("info", "Đang tiến hành tìm kiếm hóa đơn...");

    const { fromDate, toDate, queryTypes, invoiceType, filter } = data;

    try {
      const allInvoices: Invoice[] = [];
      for (const queryType of queryTypes) {
        addLog("info", `Tìm kiếm: ${queryTypeNames[queryType]}`);
        const result = await fetchAllInvoices(
          jwt,
          fromDate,
          toDate,
          filter,
          queryType,
          invoiceType,
        );
        addLog(
          "success",
          `Tìm thấy ${result.length} ${queryTypeNames[queryType]}.`,
        );
        allInvoices.push(...result);
      }

      setSearchState("success");
      addLog("success", `Tổng cộng tìm thấy ${allInvoices.length} hóa đơn.`);
      onComplete(allInvoices);
    } catch (error: any) {
      addLog("failed", `Lỗi khi tìm kiếm: ${error.message}`);
      setSearchState("failed");
    }
  }

  return {
    formInput,
    searchState,
    onLoginComplete,
    handleSearch,
    openCaptcha,
    setOpenCaptcha,
  };
}
