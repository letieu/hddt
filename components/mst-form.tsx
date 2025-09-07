"use client";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export function MstForm() {
  const [inputText, setInputText] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("dn"); // Default to dn (Doanh nghiệp)
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
      <Card className="relative overflow-hidden bg-white max-w-3xl mx-auto">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="input-tax-ids">
                  Nhập danh sách MST/Căn cước (mỗi mã một dòng)
                </Label>
                <Textarea
                  id="input-tax-ids"
                  placeholder={`1234567890
1234567891
1234567892
1234567899`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={15}
                  className="border bg-muted border-accent"
                />
              </div>
            </div>

            <div className="py-4 flex flex-wrap items-end gap-4">
              <div className="flex-grow">
                <Label htmlFor="mst-input-type">Loại tra cứu</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="mst-input-type" className="mt-2 shadow-md">
                    <SelectValue placeholder="Chọn loại tra cứu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dn">Doanh nghiệp</SelectItem>
                    <SelectItem value="cn">Cá nhân</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="flex-shrink-0"
                disabled={loading}
              >
                {loading ? "Đang tra cứu..." : "Tra cứu"}
              </Button>
              {results.length > 0 && (
                <Button
                  onClick={handleDownloadCsv}
                  className="flex-shrink-0"
                  variant="outline"
                  type="button"
                >
                  Tải xuống CSV
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {loading && <p>Đang tra cứu...</p>}
        {!loading && results.length > 0 && (
          <div className="overflow-x-auto  bg-white p-6 rounded-lg shadow-md">
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
                    <TableCell>{item["STT"] || index + 1}</TableCell>
                    <TableCell>{item["MST"] || "N/A"}</TableCell>
                    <TableCell>{item["Tên người nộp thuế"] || "N/A"}</TableCell>
                    <TableCell>
                      {item["Địa chỉ trụ sở/địa chỉ kinh doanh"] || "N/A"}
                    </TableCell>
                    <TableCell>
                      {item["Cơ quan thuế quản lý"] || "N/A"}
                    </TableCell>
                    <TableCell>{item["Trạng thái MST"] || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && results.length === 0 && inputText.length > 0 && (
          <p>Không tìm thấy dữ liệu hoặc chưa có kết quả.</p>
        )}
      </div>
    </>
  );
}
