"use client";

import { useState } from "react";
import { DotPattern } from "./magicui/dot-pattern";
import { InputForm } from "./input-form";
import { Terminal, TypingAnimation } from "./magicui/terminal";
import { CaptchaDialog } from "./captcha-popup";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";
import {
  FetchInvoiceOptions,
  fetchProfile,
  InvoiceType,
} from "@/lib/download/hoadon-api";
import {
  InvoiceExportManager,
  InvoiceExportLog,
  InvoiceExportResult,
} from "@/lib/download/invoice-export-manager";
import { cn } from "@/lib/utils";

export type ExportInput = {
  credential: {
    username: string;
    password: string;
  };
  invoiceType: InvoiceType;
  fromDate: Date;
  toDate: Date;
  filter: FetchInvoiceOptions;
  downloadFiles?: boolean;
};

export function AppSection() {
  const [logs, setLogs] = useState<Map<string, InvoiceExportLog>>(new Map());
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceExportResult | null>(null);

  const [openCaptcha, setOpenCaptcha] = useState(false);
  const [input, setInput] = useState<ExportInput>();

  const handleExport = async (input: ExportInput) => {
    setLogs(new Map());
    setInput(input);

    let currentJwt = localStorage.getItem(`jwt_${input.credential.username}`);
    if (currentJwt) {
      try {
        setLoading(true);
        await fetchProfile(currentJwt);
        await startExport(input);
      } catch (e) {
        setOpenCaptcha(true);
      } finally {
        setLoading(false);
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
      const logId = log.id ?? Date.now().toString();
      setLogs((prev) => new Map(prev).set(logId, log));
    });
    manager.on("finish", (result: InvoiceExportResult) => {
      setResult(result);
    });

    setLogs(new Map());
    setDownloading(true);
    await manager
      .start({
        fromDate: input.fromDate,
        toDate: input.toDate,
        filter: input.filter,
        invoiceType: input.invoiceType,
        downloadFiles: input.downloadFiles,
      })
      .finally(() => {
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
            <InputForm
              onStartClick={handleExport}
              downloading={downloading || loading}
            />
          </div>

          {/* Terminal */}
          <Terminal className="w-full">
            {logs.size === 0 && (
              <TypingAnimation className="text-muted-foreground">
                Chưa có tiến trình nào...
              </TypingAnimation>
            )}
            {Array.from(logs.entries()).map(([id, log]) => {
              return (
                <div key={id}>
                  <span
                    className={cn({
                      "text-red-500": log.status === "failed",
                      "text-green-500 font-bold": log.status === "success",
                    })}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })}
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

      {result && (
        <AlertDialog open={!!result} onOpenChange={() => setResult(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                Tải xuống hoàn tất!
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p>Chúc mừng! Dữ liệu hóa đơn đã được xuất thành công.</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {result.excelFileName && (
                    <p>
                      <strong>File Excel:</strong> {result.excelFileName}
                    </p>
                  )}
                  {result.zipFileName && (
                    <p>
                      <strong>File ZIP:</strong> {result.zipFileName}
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setResult(null)}>
                Đóng
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}
