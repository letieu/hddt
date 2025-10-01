"use client";

import { useEffect, useState } from "react";
import { DotPattern } from "./magicui/dot-pattern";
import { InputForm } from "./input-form";
import { Terminal, TypingAnimation } from "./magicui/terminal";
import { CaptchaDialog } from "./captcha-popup";
import { ShimmerButton } from "./magicui/shimmer-button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
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
  InvoiceItem,
} from "@/lib/download/invoice-export-manager";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  User,
} from "@supabase/supabase-js";
import { creditUsageEstimate } from "@/lib/credit";
import { Button } from "./ui/button";
import { sendGAEvent } from "@next/third-parties/google";

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

type ExportState =
  | "idle"
  | "fetching"
  | "failed"
  | "success"
  | "building"
  | "retrying";

type FailedItems = {
  failedDetails?: { invoice: InvoiceItem; queryType: string }[];
  failedXmls?: { invoice: InvoiceItem; queryType: string }[];
  failedFetches?: { queryType: string }[];
};

export function AppSection() {
  const [logs, setLogs] = useState<Map<string, InvoiceExportLog>>(new Map());
  const [result, setResult] = useState<InvoiceExportResult | null>(null);
  const [openCaptcha, setOpenCaptcha] = useState(false);
  const [input, setInput] = useState<ExportInput>();

  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  const [manager, setManager] = useState<InvoiceExportManager | null>(null);
  const [failedItems, setFailedItems] = useState<FailedItems | null>(null);
  const [exportState, setExportState] = useState<ExportState>("idle");

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

  const checkCredit = async (creditsToDeduct: number) => {
    const { error } = await supabase.functions.invoke("check-credit", {
      body: { creditAmount: creditsToDeduct },
    });

    if (!error) {
      return;
    }

    let errorMessage;
    if (error instanceof FunctionsHttpError) {
      const errorResponse = await error.context.json();
      errorMessage = errorResponse?.error ?? error.message;
    } else if (error instanceof FunctionsRelayError) {
      errorMessage = error.message;
    } else if (error instanceof FunctionsFetchError) {
      errorMessage = error.message;
    }

    return errorMessage;
  };

  const handleExport = async (input: ExportInput) => {
    if (!isLoggedIn || !user) {
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

  async function startExport(input: ExportInput, jwt: string) {
    const newManager = new InvoiceExportManager(jwt);
    setManager(newManager);

    newManager.on("log", (log: InvoiceExportLog) => {
      const logId = log.id ?? Date.now().toString();
      setLogs((prev) => new Map(prev).set(logId, log));
    });

    newManager.on(
      "finish",
      (result: {
        failedDetails?: any;
        failedXmls?: any;
        failedFetches?: any;
      }) => {
        const hasFailures =
          (result.failedDetails && result.failedDetails.length > 0) ||
          (result.failedXmls && result.failedXmls.length > 0) ||
          (result.failedFetches && result.failedFetches.length > 0);

        if (hasFailures) {
          setFailedItems({
            failedDetails: result.failedDetails,
            failedXmls: result.failedXmls,
            failedFetches: result.failedFetches,
          });
          setExportState("failed");
        } else {
          setFailedItems(null);
          setExportState("success");
          // Automatically build if successful
          newManager.build();
        }
      },
    );

    newManager.on("build-finish", (result: InvoiceExportResult) => {
      setResult(result);
      setExportState("idle");
      deductCredit(input);
    });

    setLogs(new Map());
    setExportState("fetching");
    await newManager.start(input);
  }

  const handleRetry = () => {
    if (manager) {
      setExportState("retrying");
      manager.retry();
    }
  };

  const handleBuild = () => {
    if (manager) {
      setExportState("building");
      manager.build();
    }
  };

  const deductCredit = async (input: ExportInput) => {
    const creditsToDeduct = creditUsageEstimate(
      input.fromDate,
      input.toDate,
      input.downloadFiles ?? false,
    );

    setLogs((prev) =>
      new Map(prev).set("credit-deduction", {
        status: "info",
        message: "Đang trừ credit...",
      }),
    );
    try {
      const { data, error } = await supabase.functions.invoke("deduct-credit", {
        body: { creditAmount: creditsToDeduct },
      });
      if (error) {
        throw error;
      }
      if (data.error) {
        throw new Error(data.error);
      }
      setLogs((prev) =>
        new Map(prev).set("credit-deduction-success", {
          status: "success",
          message: "Đã trừ credit thành công.",
        }),
      );
      window.dispatchEvent(new Event("credit-update"));
    } catch (e: any) {
      setLogs((prev) =>
        new Map(prev).set("credit-deduction-error", {
          status: "failed",
          message: `Lỗi khi trừ credit: ${e.message}. Vui lòng liên hệ hỗ trợ.`,
        }),
      );
    }
  };

  const isBusy =
    exportState === "fetching" ||
    exportState === "building" ||
    exportState === "retrying";

  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Tải dữ liệu hóa đơn
          </h2>
        </div>

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
                      <a
                        href="/dashboard"
                        className="underline ml-2 text-blue-500"
                      >
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
                <Button
                  onClick={handleBuild}
                  disabled={isBusy}
                  variant="secondary"
                >
                  Bỏ qua & Tải xuống
                </Button>
              </div>
            )}
          </Terminal>
        </div>

        <div className="flex justify-center text-center mt-16">
          <ShimmerButton
            className="shadow-2xl"
            onClick={() => {
              sendGAEvent("event", "buttonClicked", { value: "xyz" });
            }}
          >
            Cần hỗ trợ -&gt; liên hệ ngay
          </ShimmerButton>
        </div>
      </div>

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
    </section>
  );
}
