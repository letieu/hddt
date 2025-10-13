"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FetchInvoiceOptions,
  InvoiceQueryType,
  InvoiceType,
} from "@/lib/download/hoadon-api";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local time
}

export type HddtFormInput = {
  credential: {
    username: string;
    password: string;
  };
  invoiceType: InvoiceType;
  fromDate: Date;
  toDate: Date;
  filter: FetchInvoiceOptions;
  queryTypes: InvoiceQueryType[];
};

type HoadonGocFormProps = {
  onSearch: (data: HddtFormInput) => void;
  isBusy: boolean;
};

export function HoadonGocForm({ onSearch, isBusy }: HoadonGocFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [fromDate, setFromDate] = useState(formatDateInput(firstOfMonth));
  const [toDate, setToDate] = useState(formatDateInput(today));

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

  const handleSearchClick = () => {
    if (!validate()) {
      return;
    }
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    onSearch({
      credential: { username, password },
      invoiceType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      filter: {
        nbmst: invoiceSeller,
        nmmst: invoiceBuyer,
      },
      queryTypes,
    });
  };

  return (
    <form className="pt-4">
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
              placeholder="Tên đăng nhập"
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

        <div className="space-y-2 pt-4">
          <Button onClick={handleSearchClick} disabled={isBusy} type="button">
            {isBusy ? "Đang tìm..." : "Tìm kiếm"}
            {isBusy && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}