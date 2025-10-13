"use client";

import {
  FetchInvoiceOptions,
  InvoiceQueryType,
  InvoiceType,
  fetchAllInvoices,
  fetchProfile,
} from "@/lib/download/hoadon-api";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { HoadonGocForm, HddtFormInput } from "./hddt-form";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Terminal, TypingAnimation } from "@/components/magicui/terminal";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CaptchaDialog } from "@/components/captcha-popup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type { InvoiceType, InvoiceQueryType };

type Invoice = {
  id: string;
  khhdon: string;
  shdon: string;
  tdlap: string;
  nbten: string;
  nbmst: string;
  tgtcthue: number;
};

type LogEntry = {
  status: "info" | "success" | "failed";
  message: string;
};

const queryTypeNames: { [key in InvoiceQueryType]: string } = {
  query: "Hóa đơn điện tử",
  "sco-query": "Hóa đơn có mã từ máy tính tiền",
};

export function Downloader() {
  const [logs, setLogs] = useState<Map<string, LogEntry>>(new Map());
  const [openCaptcha, setOpenCaptcha] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  const [searchState, setSearchState] = useState<
    "idle" | "searching" | "failed" | "success"
  >("idle");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [formInput, setFormInput] = useState<HddtFormInput | null>(null);

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

  const addLog = (status: LogEntry["status"], message: string) => {
    setLogs((prev) =>
      new Map(prev).set(Date.now().toString(), { status, message }),
    );
  };

  const handleSearch = async (data: HddtFormInput) => {
    if (!isLoggedIn || !user) {
      alert("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    setFormInput(data);
    setSearchState("searching");
    setLogs(new Map());
    setInvoices([]);

    addLog("info", "Bắt đầu tìm kiếm...");

    let currentJwt = localStorage.getItem(`jwt_${data.credential.username}`);
    if (currentJwt) {
      try {
        await fetchProfile(currentJwt);
        await startSearch(currentJwt, data);
      } catch (e) {
        addLog("info", "JWT hết hạn hoặc không hợp lệ, yêu cầu captcha.");
        setOpenCaptcha(true);
      }
      return;
    }

    addLog("info", "Yêu cầu captcha để lấy token.");
    setOpenCaptcha(true);
  };

  async function startSearch(jwt: string, data: HddtFormInput) {
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

      setInvoices(allInvoices);
      setSearchState("success");
      addLog("success", `Tổng cộng tìm thấy ${allInvoices.length} hóa đơn.`);
    } catch (error: any) {
      addLog("failed", `Lỗi khi tìm kiếm: ${error.message}`);
      setSearchState("failed");
    }
  }

  const isBusy = searchState === "searching";

  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Tra cứu hoá đơn
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Nhập thông tin tra cứu</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Nhập liệu</TabsTrigger>
                  <TabsTrigger value="upload">Tải lên file XML</TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                  <HoadonGocForm onSearch={handleSearch} isBusy={isBusy} />
                </TabsContent>
                <TabsContent value="upload">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg mt-4">
                    <p>Tải lên file XML để tra cứu hàng loạt.</p>
                    <Input
                      type="file"
                      className="mt-4"
                      multiple
                      accept=".xml"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div>
            <Terminal>
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
                  </span>
                </div>
              ))}
            </Terminal>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Danh sách hóa đơn</h3>
          {searchState === "success" && invoices.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ký hiệu</TableHead>
                    <TableHead>Số hóa đơn</TableHead>
                    <TableHead>Ngày lập</TableHead>
                    <TableHead>Tên người bán</TableHead>
                    <TableHead>MST người bán</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Tải</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.khhdon}</TableCell>
                      <TableCell>{invoice.shdon}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.tdlap), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{invoice.nbten}</TableCell>
                      <TableCell>{invoice.nbmst}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN").format(
                          invoice.tgtcthue,
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Tải PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {searchState === "success" && invoices.length === 0 && (
            <div className="mt-8 text-center text-muted-foreground">
              Không tìm thấy hóa đơn nào.
            </div>
          )}

          {searchState === "idle" && (
            <div className="mt-8 text-center text-muted-foreground">
              Chưa có kết quả.
            </div>
          )}
          {searchState === "searching" && (
            <div className="mt-8 text-center text-muted-foreground">
              Đang tìm kiếm...
            </div>
          )}
          {searchState === "failed" && (
            <div className="mt-8 text-center text-destructive">
              Tìm kiếm thất bại. Vui lòng kiểm tra lại thông tin và thử lại.
            </div>
          )}
        </div>

        {formInput && (
          <CaptchaDialog
            open={openCaptcha}
            credential={formInput.credential}
            onClose={() => setOpenCaptcha(false)}
            onSuccess={(jwt) => {
              localStorage.setItem(`jwt_${formInput.credential.username}`, jwt);
              setOpenCaptcha(false);
              startSearch(jwt, formInput);
            }}
          />
        )}
      </div>
    </section>
  );
}
