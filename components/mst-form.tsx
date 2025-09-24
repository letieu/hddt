"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { RainbowButton } from "./magicui/rainbow-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { ShineBorder } from "./magicui/shine-border";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendGAEvent } from "@next/third-parties/google";

export function MstForm() {
  const [inputText, setInputText] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("cn");
  const [loading, setLoading] = useState<boolean>(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taxIds = inputText
      .split("\n")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (taxIds.length === 0) {
      alert("Vui lòng nhập mã số thuế");
      return;
    }

    sendGAEvent("check_mst_start");
    setLoading(true);
    setResults([]); // Clear previous results
    try {
      const allCrawlData: any[] = [];
      for (const mst of taxIds) {
        const { data, error } = await supabase.functions.invoke("mst-crawl", {
          body: { mst, type: selectedType },
        });

        if (error) {
          console.error(`Error crawling MST ${mst}:`, error);
          allCrawlData.push({
            MST: mst,
            "Tên người nộp thuế": "Lỗi",
            "Địa chỉ trụ sở/địa chỉ kinh doanh": error.message,
            "Cơ quan thuế quản lý": "",
            "Trạng thái MST": "",
          });
          continue;
        }

        if (data?.data && data.data.length > 0) {
          allCrawlData.push(...data.data);
        } else {
          allCrawlData.push({
            MST: mst,
            "Tên người nộp thuế": "Không tìm thấy dữ liệu",
            "Địa chỉ trụ sở/địa chỉ kinh doanh": "",
            "Cơ quan thuế quản lý": "",
            "Trạng thái MST": "",
          });
        }
      }

      setResults(allCrawlData);
      sendGAEvent("check_mst_success");
    } catch (e: any) {
      console.error("Unexpected error:", e);
      setResults([
        {
          MST: "N/A",
          "Tên người nộp thuế": "Lỗi hệ thống",
          "Địa chỉ trụ sở/địa chỉ kinh doanh": e.message,
          "Cơ quan thuế quản lý": "",
          "Trạng thái MST": "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    "STT",
    "MST",
    "Tên người nộp thuế",
    "Địa chỉ trụ sở/địa chỉ kinh doanh",
    "Cơ quan thuế quản lý",
    "Trạng thái MST",
  ];

  const handleDownloadCsv = () => {
    if (results.length === 0) return;

    const csvRows = [];
    // Add headers
    csvRows.push(headers.join(","));

    // Add data rows
    for (const item of results) {
      const values = headers.map((header) => {
        const value = item[header];
        // Handle commas and quotes in values
        return `"${String(value || "").replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "mst_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="relative overflow-hidden max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4 mb-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="input-tax-ids">
                  Nhập danh sách MST/Căn cước (mỗi mã một dòng)
                </Label>
                <div className="flex text-muted-foreground text-sm">
                  Tra cứu mã số thuế online hoàn toàn miễn phí và không cần đăng
                  ký
                </div>
                <Textarea
                  id="input-tax-ids"
                  placeholder={`1234567890
1234567891
1234567899`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  className="placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-grow">
                <Label htmlFor="mst-input-type">
                  Cá nhân hoặc doanh nghiệp
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="mst-input-type" className="mt-2">
                    <SelectValue placeholder="Chọn loại tra cứu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cn">Cá nhân</SelectItem>
                    <SelectItem value="dn">Doanh nghiệp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-3">
            <RainbowButton type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang tra cứu..." : "Tra cứu mã số thuế"}
            </RainbowButton>
          </CardFooter>
        </form>
        <ShineBorder />
      </Card>

      <div className="space-y-4 mt-8">
        {loading && (
          <Card className="max-w-7xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                Đang tra cứu, vui lòng chờ...
              </p>
            </CardContent>
          </Card>
        )}
        {!loading && results.length > 0 && (
          <Card className="max-w-7xl mx-auto">
            <CardHeader className="flex justify-between">
              <CardTitle>Kết quả tra cứu</CardTitle>
              <CardAction>
                {results.length > 0 && (
                  <Button
                    onClick={handleDownloadCsv}
                    variant="outline"
                    type="button"
                  >
                    Tải xuống CSV
                  </Button>
                )}
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-left">
                          {item["STT"] || index + 1}
                        </TableCell>
                        <TableCell className="text-left">
                          {item["MST"] || "N/A"}
                        </TableCell>
                        <TableCell className="text-left">
                          {item["Tên người nộp thuế"] || "N/A"}
                        </TableCell>
                        <TableCell className="text-left">
                          {item["Địa chỉ trụ sở/địa chỉ kinh doanh"] || "N/A"}
                        </TableCell>
                        <TableCell className="text-left">
                          {item["Cơ quan thuế quản lý"] || "N/A"}
                        </TableCell>
                        <TableCell className="text-left">
                          {item["Trạng thái MST"] || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        {!loading && results.length === 0 && inputText.length > 0 && (
          <Card className="max-w-7xl mx-auto">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Không tìm thấy dữ liệu hoặc chưa có kết quả.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
