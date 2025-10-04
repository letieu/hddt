"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RainbowButton } from "./magicui/rainbow-button";
import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { LoginButton } from "./login-button";
import { OriginalInvoiceInput } from "./app-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceType, InvoiceQueryType } from "@/lib/download/hoadon-api";
import { Checkbox } from "./ui/checkbox";
import { creditUsageEstimate } from "@/lib/credit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronRight, ShieldCheck, Upload, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local time
}

type BulkInvoice = {
  taxCode: string; // Mã số thuế người bán
  invoiceSymbol: string; // Ký hiệu hóa đơn
  invoiceNumber: string; // Số hóa đơn
};

export function OriginalInvoiceForm(props: {
  onStartClick: (input: OriginalInvoiceInput) => void;
  downloading: boolean;
  isLoggedIn: boolean;
}) {
  const { isLoggedIn } = props;
  const [inputMode, setInputMode] = useState<"credentials" | "bulk">("credentials");
  
  // Credentials mode states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(formatDateInput(firstOfMonth));
  const [toDate, setToDate] = useState(formatDateInput(today));

  const [invoiceBuyer, setInvoiceBuyer] = useState("");
  const [invoiceSeller, setInvoiceSeller] = useState("");
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("purchase");
  const [queryTypes, setQueryTypes] = useState<InvoiceQueryType[]>(["query"]);
  
  // Bulk input mode states
  const [bulkInvoices, setBulkInvoices] = useState<BulkInvoice[]>([]);
  const [bulkInputText, setBulkInputText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    date: "",
    queryTypes: "",
    bulkInput: "",
  });

  const validate = () => {
    const newErrors = {
      username: "",
      password: "",
      date: "",
      queryTypes: "",
      bulkInput: "",
    };

    let isValid = true;
    
    if (inputMode === "credentials") {
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
    } else if (inputMode === "bulk") {
      if (bulkInvoices.length === 0) {
        newErrors.bulkInput = "Vui lòng nhập danh sách hóa đơn hoặc upload file Excel.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const parseBulkInput = (text: string): BulkInvoice[] => {
    const lines = text.trim().split("\n");
    const invoices: BulkInvoice[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Split by comma, tab, or multiple spaces
      const parts = trimmedLine.split(/[,\t]+|\s{2,}/).map(p => p.trim());
      
      if (parts.length >= 3) {
        invoices.push({
          taxCode: parts[0],
          invoiceSymbol: parts[1],
          invoiceNumber: parts[2],
        });
      }
    }
    
    return invoices;
  };

  const handleBulkInputChange = (text: string) => {
    setBulkInputText(text);
    const invoices = parseBulkInput(text);
    setBulkInvoices(invoices);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet, { header: 1 });

      const invoices: BulkInvoice[] = [];
      
      // Skip header row if it exists
      const startRow = jsonData[0] && typeof jsonData[0][0] === 'string' ? 1 : 0;
      
      for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 3 && row[0] && row[1] && row[2]) {
          invoices.push({
            taxCode: String(row[0]).trim(),
            invoiceSymbol: String(row[1]).trim(),
            invoiceNumber: String(row[2]).trim(),
          });
        }
      }

      setBulkInvoices(invoices);
      
      // Update text area to show parsed data
      const text = invoices
        .map(inv => `${inv.taxCode}, ${inv.invoiceSymbol}, ${inv.invoiceNumber}`)
        .join("\n");
      setBulkInputText(text);
    } catch (error) {
      alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.");
      console.error("Error reading Excel file:", error);
    }
  };

  const clearFileUpload = () => {
    setUploadedFileName("");
    setBulkInputText("");
    setBulkInvoices([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!validate()) {
      return;
    }
    
    if (inputMode === "credentials") {
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
        queryTypes,
        inputMode: "credentials",
      });
    } else {
      // Bulk mode - no credentials needed
      props.onStartClick({
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        credential: {
          username: "",
          password: "",
        },
        filter: {},
        invoiceType: "purchase", // Default for bulk mode
        queryTypes: ["query"],
        inputMode: "bulk",
        bulkInvoices,
      });
    }
  };

  const estimateCreditUsage = useMemo(() => {
    if (inputMode === "bulk") {
      // For bulk mode, estimate based on number of invoices
      return bulkInvoices.length * 2; // 2 credits per invoice (adjust as needed)
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    // Original invoice download will have different credit calculation
    // For now, use the same calculation
    return creditUsageEstimate(from, to, true);
  }, [fromDate, toDate, inputMode, bulkInvoices.length]);

  return (
    <div className="relative rounded-xl border border-pink-200/30 dark:border-pink-400/20 bg-gradient-to-br from-pink-50/20 to-orange-50/20 dark:from-pink-950/10 dark:to-orange-950/10 backdrop-blur p-6 shadow-lg transition-all duration-200">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-pink-400 to-orange-400 dark:from-pink-300 dark:to-orange-300 bg-clip-text text-transparent">
          Nhập thông tin
        </h3>
        <p className="text-sm text-muted-foreground">
          Chọn phương thức nhập dữ liệu hóa đơn
        </p>
      </div>
      <div>
        <Tabs
          value={inputMode}
          onValueChange={(value) => setInputMode(value as "credentials" | "bulk")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="credentials">
              Sử dụng thông tin từ hoadondientu.gdt.gov.vn
            </TabsTrigger>
            <TabsTrigger value="bulk">
              Nhập danh sách hóa đơn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            <Alert className="mb-4">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Lo ngại về bảo mật?</AlertTitle>
              <AlertDescription>
                <Link
                  href="/blog/tai-hoa-don-extension"
                  className="font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                >
                  Sử dụng extension của chúng tôi
                </Link>{" "}
              </AlertDescription>
            </Alert>
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
                <div className="space-y-2">
                  <Label>Loại truy vấn <span className="text-destructive">*</span></Label>
                  {errors.queryTypes && (
                    <p className="text-sm text-destructive">{errors.queryTypes}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="query-type-query-original"
                      checked={queryTypes.includes("query")}
                      onCheckedChange={(checked) =>
                        setQueryTypes((prev) =>
                          checked
                            ? [...prev, "query"]
                            : prev.filter((t) => t !== "query"),
                        )
                      }
                    />
                    <Label htmlFor="query-type-query-original" className="font-normal">
                      Hóa đơn điện tử
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="query-type-sco-query-original"
                      checked={queryTypes.includes("sco-query")}
                      onCheckedChange={(checked) =>
                        setQueryTypes((prev) =>
                          checked
                            ? [...prev, "sco-query"]
                            : prev.filter((t) => t !== "sco-query"),
                        )
                      }
                    />
                    <Label htmlFor="query-type-sco-query-original" className="font-normal">
                      Hóa đơn có mã từ máy tính tiền
                    </Label>
                  </div>
                </div>
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                  <CollapsibleTrigger className="text-sm font-bold flex items-center gap-1">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform transform",
                        isAdvancedOpen && "rotate-90",
                      )}
                    />
                    Tùy chọn nâng cao...
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    {/* Additional options for original invoice will be added here */}
                    <p className="text-sm text-muted-foreground">Các tùy chọn nâng cao sẽ được bổ sung sau.</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk">
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Định dạng danh sách hóa đơn</AlertTitle>
                <AlertDescription>
                  Mỗi dòng chứa: <strong>Mã số thuế người bán, Ký hiệu hóa đơn, Số hóa đơn</strong>
                  <br />
                  Ví dụ: 0123456789, C22TAA, 00001234
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="bulk-file-upload">
                  Upload file Excel (.xlsx, .xls)
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedFileName || "Chọn file Excel"}
                  </Button>
                  {uploadedFileName && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFileUpload}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  File Excel cần có 3 cột: Mã số thuế người bán, Ký hiệu hóa đơn, Số hóa đơn
                </p>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="bulk-input">
                  Hoặc nhập thủ công (mỗi hóa đơn một dòng)
                </Label>
                <Textarea
                  id="bulk-input"
                  placeholder="0123456789, C22TAA, 00001234&#10;0987654321, C22TBB, 00005678"
                  value={bulkInputText}
                  onChange={(e) => handleBulkInputChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                {errors.bulkInput && (
                  <p className="text-sm text-destructive">{errors.bulkInput}</p>
                )}
                {bulkInvoices.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Đã nhận diện: <strong>{bulkInvoices.length}</strong> hóa đơn
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex justify-between mt-6 pt-6 border-t border-border">
        {isLoggedIn ? (
          <RainbowButton
            className="w-full"
            onClick={handleClick}
            disabled={props.downloading}
          >
            Tải hóa đơn gốc{" "}
            <span className="ml-1">( {estimateCreditUsage || 0} Credit )</span>
            {props.downloading && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            )}
          </RainbowButton>
        ) : (
          <LoginButton className="w-full" text="Đăng nhập để tải file" />
        )}
      </div>
    </div>
  );
}
