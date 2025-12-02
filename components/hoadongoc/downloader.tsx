"use client";

import { useState } from "react";
import { CaptchaDialog } from "@/components/captcha-popup";
import { useHoadonDientuSearch } from "./hooks/use-hoadondientu-search";
import { InvoiceWithProvider, LogEntry } from "@/lib/hoadongoc/types";
import { detectProvider } from "@/lib/hoadongoc/utils";
import { InputForm } from "./downloader/input-form";
import { Logs } from "./downloader/logs";
import { ResultTable } from "./downloader/result-table";

export function Downloader() {
  const [logs, setLogs] = useState<Map<string, LogEntry>>(new Map());
  const [invoices, setInvoices] = useState<InvoiceWithProvider[]>([]);
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  const addLog = (status: LogEntry["status"], message: string) => {
    setLogs((prev) =>
      new Map(prev).set(Date.now().toString(), { status, message }),
    );
  };

  const {
    formInput,
    searchState,
    onLoginComplete,
    handleSearch,
    openCaptcha,
    setOpenCaptcha,
  } = useHoadonDientuSearch(addLog, (invoices) => {
    const invoicesWithProvider = detectProvider(invoices);
    setInvoices(invoicesWithProvider);
  });

  const handleDownloadPdf = async (invoice: InvoiceWithProvider) => {
    setDownloading((prev) => ({ ...prev, [invoice.id]: true }));
    addLog("info", `Bắt đầu tải PDF hóa đơn ${invoice.shdon}`);
    try {
      const response = await fetch("/api/hoadongoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          khhdon: invoice.khhdon,
          shdon: invoice.shdon,
          msttcgp: invoice.msttcgp,
          nbmst: invoice.nbmst,
          id: invoice.id,
          ttkhac: invoice.ttkhac,
          cttkhac: invoice.cttkhac,
          nbcks: invoice.nbcks,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tải PDF thất bại: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hoa-don-${invoice.shdon}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addLog("success", `Đã tải xong PDF cho hóa đơn ${invoice.shdon}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        addLog("failed", `Lỗi khi tải PDF: ${error.message}`);
      } else {
        addLog("failed", `Lỗi khi tải PDF: ${String(error)}`);
      }
    } finally {
      setDownloading((prev) => ({ ...prev, [invoice.id]: false }));
    }
  };

  const isBusy = searchState === "searching";

  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Tra cứu hoá đơn
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputForm onSearch={handleSearch} isBusy={isBusy} />
          <div>
            <Logs logs={logs} />
          </div>
        </div>

        <ResultTable
          searchState={searchState}
          invoices={invoices}
          downloading={downloading}
          handleDownloadPdf={handleDownloadPdf}
        />

        {formInput && (
          <CaptchaDialog
            open={openCaptcha}
            credential={formInput.credential}
            onClose={() => setOpenCaptcha(false)}
            onSuccess={onLoginComplete}
          />
        )}
      </div>
    </section>
  );
}
