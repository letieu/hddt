"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RainbowButton } from "./magicui/rainbow-button";
import { useMemo, useState } from "react";
import { LoginButton } from "./login-button";
import { ShineBorder } from "./magicui/shine-border";
import { ExportInput } from "./app-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceType } from "@/lib/download/hoadon-api";
import { Checkbox } from "./ui/checkbox";
import { creditUsageEstimate } from "@/lib/credit";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local time
}

export function InputForm(props: {
  onStartClick: (input: ExportInput) => void;
  downloading: boolean;
  isLoggedIn: boolean;
}) {
  const { isLoggedIn } = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [downloadFiles, setDownloadFiles] = useState(false);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(formatDateInput(firstOfMonth));
  const [toDate, setToDate] = useState(formatDateInput(today));

  const [invoiceBuyer, setInvoiceBuyer] = useState("");
  const [invoiceSeller, setInvoiceSeller] = useState("");
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("purchase");
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    date: "",
  });

  const validate = () => {
    const newErrors = {
      username: "",
      password: "",
      date: "",
    };

    let isValid = true;
    if (!username) {
      newErrors.username = "Tên đăng nhập không được để trống.";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
      isValid = false;
    }
    if (!fromDate || !toDate) {
      newErrors.date = "Vui lòng chọn khoảng ngày.";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleClick = () => {
    if (!validate()) {
      return;
    }
    props.onStartClick({
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      credential: {
        username,
        password,
      },
      filter: {
        nbmst: invoiceSeller,
        nmmst: invoiceBuyer,
      },
      invoiceType: invoiceType,
      downloadFiles,
    });
  };

  const estimateCreditUsage = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const isDownloadFiles = downloadFiles;
    return creditUsageEstimate(from, to, isDownloadFiles);
  }, [fromDate, toDate, downloadFiles]);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>Nhập thông tin</CardTitle>
        <CardDescription>
          Sử dụng thông tin đăng nhập từ trang{" "}
          <a
            href="https://hoadondientu.gdt.gov.vn/"
            target="_blank"
            className="text-accent underline"
          >
            hoadondientu.gdt.gov.vn
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex space-x-4">
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="username">
                  Tài khoản{" "}
                  <span className="text-accent hidden md:inline">hoadondientu.gdt.gov.vn</span>{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="Tên đăng nhập từ hoadondientu.gdt.gov.vn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>
                Khoảng ngày <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  id="from-date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={formatDateInput(today)}
                />
                <span>đến</span>
                <Input
                  type="date"
                  id="to-date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={formatDateInput(today)}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>
            <Tabs
              value={invoiceType}
              onValueChange={(value) => {
                const newType = value as InvoiceType;
                setInvoiceType(newType);
                if (newType === "purchase") {
                  setInvoiceBuyer("");
                } else {
                  setInvoiceSeller("");
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2 bg-background">
                <TabsTrigger value="purchase">Hoá đơn mua vào</TabsTrigger>
                <TabsTrigger value="sold">Hoá đơn bán ra</TabsTrigger>
              </TabsList>
              <TabsContent value="purchase">
                <div className="flex flex-col space-y-1.5 pt-4">
                  <Label htmlFor="invoice-seller">Mã số thuế người bán</Label>
                  <Input
                    id="invoice-seller"
                    placeholder="Nhập mã số thuế người bán"
                    value={invoiceSeller}
                    onChange={(e) => setInvoiceSeller(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="sold">
                <div className="flex flex-col space-y-1.5 pt-4">
                  <Label htmlFor="invoice-buyer">Mã số thuế người mua</Label>
                  <Input
                    id="invoice-buyer"
                    placeholder="Nhập mã số thuế người mua"
                    value={invoiceBuyer}
                    onChange={(e) => setInvoiceBuyer(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="download-files"
                checked={downloadFiles}
                onCheckedChange={(checked) => setDownloadFiles(!!checked)}
              />
              <Label htmlFor="download-files">Tải file XML, HTML hóa đơn</Label>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isLoggedIn ? (
          <RainbowButton
            className="w-full"
            onClick={handleClick}
            disabled={props.downloading}
          >
            Xuất dữ liệu{" "}
            <span className="ml-1">( {estimateCreditUsage || 0} Credit )</span>
            {props.downloading && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            )}
          </RainbowButton>
        ) : (
          <LoginButton className="w-full" text="Đăng nhập để tải file" />
        )}
      </CardFooter>
      <ShineBorder />
    </Card>
  );
}
