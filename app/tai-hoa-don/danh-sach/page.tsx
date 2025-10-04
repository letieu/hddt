"use client";

import { useState } from "react";
import { InputForm } from "@/components/input-form";
import { Terminal, TypingAnimation } from "@/components/magicui/terminal";
import { CaptchaDialog } from "@/components/captcha-popup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInvoiceDownload } from "@/hooks/use-invoice-download";
import { ExportInput } from "@/components/app-section";
import { fetchProfile } from "@/lib/download/hoadon-api";
import { InvoiceExportManager } from "@/lib/download/invoice-export-manager";
import { creditUsageEstimate } from "@/lib/credit";
import { sendGAEvent } from "@next/third-parties/google";

export default function InvoiceListPage() {

  const [input, setInput] = useState<ExportInput>();

  const startExport = async (input: ExportInput, jwt: string) => {
    const newManager = new InvoiceExportManager(jwt);
    setManager(newManager);

    newManager.on("log", (log) => {
      setLogs((prev) => new Map(prev).set(log.id || `${Date.now()}`, log));
    });

    newManager.on("finish", (failedItems) => {
      setExportState("success");
      setFailedItems(failedItems);
      handleBuild();
    });

    try {
      await newManager.start(input);
    } catch (err: any) {
      setExportState("failed");
      setLogs((prev) =>
        new Map(prev).set("export-error", {
          status: "failed",
          message: `Lỗi: ${err.message}`,
        })
      );
    }
  };

  const handleExport = async (input: ExportInput) => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    setExportState("fetching");
    setLogs(new Map());
    setFailedItems(null);
    setResult(null);

    const creditsToDeduct = creditUsageEstimate(
      input.fromDate,
      input.toDate,
      input.downloadFiles ?? false,
    );

    const errorMessage = await checkCredit(creditsToDeduct);
    if (errorMessage) {
      setLogs((prev) =>
        new Map(prev).set("credit-error", {
          status: "failed",
          message: errorMessage,
        }),
      );
      setExportState("idle");
      return;
    }

    setInput(input);

    let currentJwt = localStorage.getItem(`jwt_${input.credential.username}`);
    if (currentJwt) {
      try {
        await fetchProfile(currentJwt);
        await startExport(input, currentJwt);
      } catch (e) {
        setOpenCaptcha(true);
      }
      return;
    }

    setOpenCaptcha(true);
    setExportState("idle");
  };

  const handleBuild = async () => {
  };

  const handleRetry = async () => {
    if (!manager) return;
    setExportState("retrying");
    await manager.retry();
  };

  return (
    <div className="grid xl:grid-cols-2 gap-12 items-start">
      <div>
        <InputForm
          onStartClick={handleExport}
          downloading={isBusy}
          isLoggedIn={isLoggedIn}
        />
      </div>

      <Terminal className="w-full">
        {logs.size === 0 && (
          <TypingAnimation className="text-muted-foreground">
            Chưa có tiến trình nào...
          </TypingAnimation>
        )}
        {Array.from(logs.entries()).map(([id, log]) => (
          <div key={id}>
            <span
              className={cn({
                "text-red-500": log.status === "failed",
                "text-green-500 font-bold": log.status === "success",
              })}
            >
              {log.message}
              {id === "credit-error" &&
                log?.message?.includes("Bạn không đủ Credit") && (
                  <a href="/dashboard" className="underline ml-2 text-blue-500">
                    Nạp Credit
                  </a>
                )}
            </span>
          </div>
        ))}
        {exportState === "failed" && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleRetry} disabled={isBusy}>
              Thử lại
            </Button>
            <Button onClick={handleBuild} disabled={isBusy} variant="secondary">
              Bỏ qua & Tải xuống
            </Button>
          </div>
        )}
      </Terminal>

      {input?.credential && (
        <CaptchaDialog
          open={openCaptcha}
          credential={input.credential}
          onClose={() => setOpenCaptcha(false)}
          onSuccess={(jwt) => {
            localStorage.setItem(`jwt_${input.credential?.username}`, jwt);
            setOpenCaptcha(false);
            if (input) {
              startExport(input, jwt);
            }
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
              <div>
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
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setResult(null)}>
                Đóng
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
