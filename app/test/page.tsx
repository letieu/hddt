"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function TestPage() {
  const [invoiceDetail, setInvoiceDetail] = useState<string>();

  const handleDownloadPdf = async () => {
    try {
      const response = await fetch("/api/hoadongoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: invoiceDetail,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tải PDF thất bại: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hoa-don.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      Test Page
      <Textarea
        value={invoiceDetail}
        onChange={(e) => setInvoiceDetail(e.target.value)}
      />
      <Button onClick={handleDownloadPdf}>Download</Button>
    </div>
  );
}
