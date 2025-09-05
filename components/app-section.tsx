"use client";

import * as XLSX from "xlsx";
import { useState, useRef, useEffect } from "react";
import { DotPattern } from "./magicui/dot-pattern";
import { InputForm } from "./input-form";
import { Terminal, TypingAnimation } from "./magicui/terminal";
import { CaptchaDialog } from "./captcha-popup";

import {
  FetchInvoiceOptions,
  fetchProfile,
  InvoiceType,
} from "@/lib/download/hoadon-api";
import {
  InvoiceExportManager,
  InvoiceExportLog,
} from "@/lib/download/invoice-export-manager";

export type ExportInput = {
  credential: {
    username: string;
    password: string;
  };
  invoiceType: InvoiceType;
  fromDate: Date;
  toDate: Date;
  filter: FetchInvoiceOptions;
};

export function AppSection() {
  const [logs, setLogs] = useState<Map<string, InvoiceExportLog>>(new Map());
  const [downloading, setDownloading] = useState(false);

  const [openCaptcha, setOpenCaptcha] = useState(false);
  const [input, setInput] = useState<ExportInput>();

  const handleExport = async (input: ExportInput) => {
    setLogs(new Map());
    setInput(input);

    let currentJwt = localStorage.getItem(`jwt_${input.credential.username}`);
    if (currentJwt) {
      try {
        await fetchProfile(currentJwt);
        await startExport(input);
      } catch (e) {
        setOpenCaptcha(true);
      }
      return;
    }

    setOpenCaptcha(true);
  };

  async function startExport(input: ExportInput) {
    let currentJwt = localStorage.getItem(`jwt_${input.credential?.username}`);
    if (!currentJwt) {
      alert("need token");
      return;
    }

    const manager = new InvoiceExportManager(currentJwt);
    manager.on("log", (log: InvoiceExportLog) => {
      setLogs((prev) => new Map(prev).set(log.id!, log));
    });

    setLogs(new Map());
    setDownloading(true);
    await manager.start({
      fromDate: input.fromDate,
      toDate: input.toDate,
      filter: input.filter,
      invoiceType: input.invoiceType,
    }).finally(() => {
      setDownloading(false);
    });
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Công Cụ Xuất Hóa Đơn
          </h2>
        </div>

        <div className="grid xl:grid-cols-2 gap-12 items-start">
          {/* Input Form */}
          <div>
            <InputForm onStartClick={handleExport} downloading={downloading} />
          </div>

          {/* Terminal */}
          <Terminal className="w-full">
            {logs.size === 0 && (
              <TypingAnimation className="text-muted-foreground">
                Chưa có tiến trình nào...
              </TypingAnimation>
            )}
            {Array.from(logs.entries()).map(([id, log]) => (
              <div key={id}>
                <span className={log.status === "failed" ? "text-red-500" : ""}>
                  {log.message}
                </span>
              </div>
            ))}
          </Terminal>
        </div>
      </div>

      {input?.credential && (
        <CaptchaDialog
          open={openCaptcha}
          credential={input.credential}
          onClose={() => setOpenCaptcha(false)}
          onSuccess={(jwt) => {
            console.log("Got token:", jwt);
            localStorage.setItem(`jwt_${input.credential?.username}`, jwt);
            setOpenCaptcha(false);
            startExport(input);
          }}
        />
      )}
    </section>
  );
}
