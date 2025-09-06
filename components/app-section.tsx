"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

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

  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session?.user);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleExport = async (input: ExportInput) => {
    if (!isLoggedIn || !user) {
      alert("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    setLoading(true);
    setLogs(new Map());

    // Calculate creditsToDeduct
    const fromDate = input.fromDate;
    const toDate = input.toDate;
    const downloadFiles = input.downloadFiles;

    // Calculate months: (year_diff * 12) + month_diff + 1 (to include current month)
    const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth()) + 1;
    let creditsToDeduct = months * 10; // 1 month = 10 credit

    if (downloadFiles) {
      creditsToDeduct *= 2; // Double credit usage if downloadFiles is true
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-credit", {
        body: { creditAmount: creditsToDeduct },
      });

      if (error) {
        throw new Error("Lỗi khi kết nối tới máy chủ.");
      }

      // The check-credit function now returns an error if insufficient credits
      // and includes the current credit count in the response body.
      // So, we check for data.error or if the returned credit_count is less than required.
      if (data.error) {
        throw new Error(data.error);
      }

      // The check-credit function now handles the credit check internally and returns 403 if insufficient.
      // The error handling above will catch the 403 from the edge function.

    } catch (error: any) {
      setLogs(
        new Map([
          ["credit-error", { status: "failed", message: error.message }],
        ]),
      );
      setLoading(false);
      return;
    }

    // Credit check passed. Now do the export.
    setInput(input);

    let currentJwt = localStorage.getItem(`jwt_${input.credential.username}`);
    if (currentJwt) {
      try {
        await fetchProfile(currentJwt);
        await startExport(input, creditsToDeduct); // Pass creditsToDeduct
      } catch (e) {
        setOpenCaptcha(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    setOpenCaptcha(true);
    setLoading(false); // if no jwt, open captcha and stop loading.
  };

  // Modify startExport signature to accept creditsToDeduct
  async function startExport(input: ExportInput, creditsToDeduct: number) {
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
    manager.on("finish", async (result: InvoiceExportResult) => {
      setResult(result);
      if (result.excelFileName || result.zipFileName) {
        // If the export was successful, deduct credit.
        setLogs((prev) =>
          new Map(prev).set("credit-deduction", {
            status: "info",
            message: "Đang trừ credit...",
          })
        );
        try {
          // Pass creditsToDeduct to deduct-credit function
          const { data, error } = await supabase.functions.invoke("deduct-credit", {
            body: { creditAmount: creditsToDeduct },
          });
          if (error) {
            setLogs((prev) =>
              new Map(prev).set("credit-deduction-error", {
                status: "failed",
                message: `Lỗi khi trừ credit: ${error.message}. Vui lòng liên hệ hỗ trợ.`,
              })
            );
          } else if (data.error) {
            setLogs((prev) =>
              new Map(prev).set("credit-deduction-error", {
                status: "failed",
                message: `Lỗi khi trừ credit: ${data.error}. Vui lòng liên hệ hỗ trợ.`,
              })
            );
          }
          else {
            setLogs((prev) =>
              new Map(prev).set("credit-deduction-success", {
                status: "success",
                message: "Đã trừ credit thành công.",
              })
            );
            window.dispatchEvent(new Event("credit-update"));
          }
        } catch (e: any) {
          setLogs((prev) =>
            new Map(prev).set("credit-deduction-error", {
              status: "failed",
              message: `Lỗi khi trừ credit: ${e.message}. Vui lòng liên hệ hỗ trợ.`,
            })
          );
        }
      }
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
              isLoggedIn={isLoggedIn}
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
                    {id === 'credit-error' && log.message.includes("Bạn không đủ Credit") && (
                      <a href="/dashboard" className="underline ml-2 text-blue-500">Nạp Credit</a>
                    )}
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
    </section>
  );
}
