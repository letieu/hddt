'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InvoiceWithProvider,
  mockInvoice,
} from "@/lib/hoadongoc/types";

interface ResultTableProps {
  searchState: "idle" | "searching" | "success" | "failed";
  invoices: InvoiceWithProvider[];
  downloading: Record<string, boolean>;
  handleDownloadPdf: (invoice: InvoiceWithProvider) => void;
}

export function ResultTable({
  searchState,
  invoices,
  downloading,
  handleDownloadPdf,
}: ResultTableProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Danh sách hóa đơn</h3>
        {searchState === "success" && invoices.length > 0 && (
          <span className="text-muted-foreground">
            Tìm thấy {invoices.length} hóa đơn
          </span>
        )}
      </div>
      {searchState === "success" && invoices.length > 0 && (
        <Card className="rounded-md border max-h-[500px] overflow-y-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="sticky top-0 bg-background">
                <TableHead className="whitespace-normal break-words">
                  Ký hiệu - Số hóa đơn
                </TableHead>
                <TableHead className="whitespace-normal break-words">
                  Người bán
                </TableHead>
                <TableHead className="whitespace-normal break-words">
                  Nhà cung cấp HĐĐT
                </TableHead>
                <TableHead className="whitespace-normal break-all">
                  Link tra cứu
                </TableHead>
                <TableHead className="whitespace-normal break-words">
                  Thông tin tra cứu
                </TableHead>
                <TableHead>Tải</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="whitespace-normal break-words">
                    {invoice.khhdon} - {invoice.shdon}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal break-words">
                    {invoice.nbmst} - {invoice.nbten}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal break-words">
                    {invoice.msttcgp} -{" "}
                    {invoice.providerInfo?.name || "Chưa xác định"}
                  </TableCell>
                  <TableCell className="max-w-sm whitespace-normal break-all">
                    {invoice.providerLookupUrl}
                  </TableCell>
                  <TableCell className="max-w-sm whitespace-normal break-words">
                    {invoice.providerLookupInfo}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(invoice)}
                      disabled={downloading[invoice.id]}
                    >
                      {downloading[invoice.id] ? "Đang tải..." : "Tải PDF"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {searchState === "success" && invoices.length === 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          Không tìm thấy hóa đơn nào.
        </div>
      )}

      {searchState === "idle" && (
        <div>
          <Card className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ký hiệu</TableHead>
                  <TableHead>Số hóa đơn</TableHead>
                  <TableHead>Người bán</TableHead>
                  <TableHead>Nhà cung cấp HĐĐT</TableHead>
                  <TableHead>Link tra cứu</TableHead>
                  <TableHead>Thông tin tra cứu</TableHead>
                  <TableHead>Tải</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="opacity-50 cursor-not-allowed">
                  <TableCell>{mockInvoice.khhdon}</TableCell>
                  <TableCell>{mockInvoice.shdon}</TableCell>
                  <TableCell className="max-w-xs break-words">
                    {mockInvoice.nbmst} - {mockInvoice.nbten}
                  </TableCell>
                  <TableCell className="max-w-xs break-words">
                    {mockInvoice.msttcgp} - {mockInvoice.providerInfo?.name}
                  </TableCell>
                  <TableCell className="max-w-sm break-all">
                    {mockInvoice.providerLookupUrl}
                  </TableCell>
                  <TableCell className="max-w-sm break-words">
                    {mockInvoice.providerLookupInfo}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" disabled>
                      Tải PDF
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
          <div className="mt-4 text-center text-muted-foreground">
            Chưa có kết quả.
          </div>
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
  );
}
