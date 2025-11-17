"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RainbowButton } from "./magicui/rainbow-button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { LoginButton } from "./login-button";
import { ExportInput, InvoiceQueryType, InvoiceType } from "./app-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [downloadXml, setDownloadXml] = useState(true);
  const [downloadHtml, setDownloadHtml] = useState(true);
  const [downloadPdf, setDownloadPdf] = useState(false);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(formatDateInput(firstOfMonth));
  const [toDate, setToDate] = useState(formatDateInput(today));

  const getValidDateString = (dateString: string): string => {
    if (!dateString) {
      return "";
    }

    const parts = dateString.split("-");
    if (parts.length !== 3) {
      return dateString; // Not a full YYYY-MM-DD string yet
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-indexed month
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return dateString; // If any part is not a number, return original
    }

    // Check for valid month range (1-12)
    if (month < 1 || month > 12) {
      return dateString; // Invalid month, return original
    }

    // Get the last day of the given month
    const lastDayOfTargetMonth = new Date(year, month, 0).getDate();

    // If the day is greater than the last day of the month, set it to the last day
    if (day > lastDayOfTargetMonth) {
      return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(lastDayOfTargetMonth).padStart(2, "0")}`;
    }

    // If the day is valid, return the original string (padded for consistency)
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const [invoiceBuyer, setInvoiceBuyer] = useState("");
  const [invoiceSeller, setInvoiceSeller] = useState("");
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("purchase");
  const [queryTypes, setQueryTypes] = useState<InvoiceQueryType[]>(["query"]);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    date: "",
    queryTypes: "",
  });

  const validate = () => {
    const newErrors = {
      username: "",
      password: "",
      date: "",
      queryTypes: "",
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
    if (queryTypes.length === 0) {
      newErrors.queryTypes = "Vui lòng chọn loại truy vấn.";
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
      downloadXml,
      downloadHtml,
      downloadPdf,
      queryTypes,
    });
  };

  const estimateCreditUsage = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const isDownloadFiles = downloadXml || downloadHtml || downloadPdf;
    return creditUsageEstimate(from, to, isDownloadFiles);
  }, [fromDate, toDate, downloadXml, downloadHtml, downloadPdf]);

  return (
    <Card className="relative overflow-hidden">
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex space-x-4">
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="hddt-username">
                  Tài khoản{" "}
                  <span className="text-accent hidden md:inline">
                    hoadondientu.gdt.gov.vn
                  </span>{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="httd-username"
                  placeholder="Tên đăng nhập từ hoadondientu.gdt.gov.vn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="hddt-password">
                  Mật khẩu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hddt-password"
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
                  onChange={(e) =>
                    setFromDate(getValidDateString(e.target.value))
                  }
                  max={formatDateInput(today)}
                />
                <span>đến</span>
                <Input
                  type="date"
                  id="to-date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(getValidDateString(e.target.value))
                  }
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
                  <Label htmlFor="invoice-seller">
                    MST người bán (không bắt buộc)
                  </Label>
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
                  <Label htmlFor="invoice-buyer">
                    MST người mua (không bắt buộc)
                  </Label>
                  <Input
                    id="invoice-buyer"
                    placeholder="Nhập mã số thuế người mua"
                    value={invoiceBuyer}
                    onChange={(e) => setInvoiceBuyer(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Loại truy vấn</Label>
              {errors.queryTypes && (
                <p className="text-sm text-destructive">{errors.queryTypes}</p>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="query-type-query"
                  checked={queryTypes.includes("query")}
                  onCheckedChange={(checked) =>
                    setQueryTypes((prev) =>
                      checked
                        ? [...prev, "query"]
                        : prev.filter((t) => t !== "query"),
                    )
                  }
                />
                <Label htmlFor="query-type-query" className="font-normal">
                  Hóa đơn điện tử
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="query-type-sco-query"
                  checked={queryTypes.includes("sco-query")}
                  onCheckedChange={(checked) =>
                    setQueryTypes((prev) =>
                      checked
                        ? [...prev, "sco-query"]
                        : prev.filter((t) => t !== "sco-query"),
                    )
                  }
                />
                <Label htmlFor="query-type-sco-query" className="font-normal">
                  Hóa đơn có mã từ máy tính tiền
                </Label>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Label>Loại file tải về</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="download-excel"
                  disabled
                  checked={true}
                />
                <Label htmlFor="download-excel" className="font-normal">
                  Tải file Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="download-xml"
                  checked={downloadXml}
                  onCheckedChange={(checked) => setDownloadXml(!!checked)}
                />
                <Label htmlFor="download-xml" className="font-normal">
                  Tải file XML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="download-html"
                  checked={downloadHtml}
                  onCheckedChange={(checked) => setDownloadHtml(!!checked)}
                />
                <Label htmlFor="download-html" className="font-normal">
                  Tải file HTML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="download-pdf"
                  checked={downloadPdf}
                  onCheckedChange={(checked) => setDownloadPdf(!!checked)}
                />
                <Label htmlFor="download-pdf" className="font-normal">
                  Tải file PDF
                </Label>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col justify-between">
        {isLoggedIn ? (
          <div className="flex w-full flex-col">
            <RainbowButton
              className="w-full"
              onClick={handleClick}
              disabled={props.downloading}
            >
              Tải dữ liệu{" "}
              <span className="ml-1">
                (Tốn {estimateCreditUsage || 0} Credit )
              </span>
              {props.downloading && (
                <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
              )}
            </RainbowButton>
            <a
              href="https://taihoadon.online/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-right text-sm text-blue-500 hover:underline"
            >
              Nạp thêm Credit
            </a>
          </div>
        ) : (
          <LoginButton className="w-full" text="Đăng nhập để tải file" />
        )}
      </CardFooter>
    </Card>
  );
}
