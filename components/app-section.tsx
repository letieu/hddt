"use client";

import { useState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, CheckCircle, FileText, Sparkles } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "./magicui/number-ticker";
import { DotPattern } from "./magicui/dot-pattern";
import { BorderBeam } from "./magicui/border-beam";
import { InputForm } from "./input-form";
import { AnimatedSpan, Terminal, TypingAnimation } from "./magicui/terminal";

export function AppSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setLogs([]);
    setInvoiceCount(0);

    const exportLogs = [
      "🔐 Đang xác thực thông tin đăng nhập...",
      "✅ Xác thực thành công",
      "📅 Xử lý khoảng thời gian: 01/01/2024 đến 31/12/2024",
      "🔍 Đang tìm kiếm hóa đơn phù hợp với tiêu chí...",
      "📊 Tìm thấy hóa đơn để xuất",
      "📄 Đang tạo file Excel tổng hợp...",
      "📦 Đang đóng gói các file XML hóa đơn...",
      "💾 Đang tạo gói tải xuống...",
      "✅ Xuất hoàn tất! Bắt đầu tải xuống...",
    ];

    for (let i = 0; i < exportLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (i === 4) {
        // Animate invoice count when we find invoices
        let currentCount = 0;
        const targetCount = 2847;
        const incrementCount = () => {
          if (currentCount < targetCount) {
            currentCount += Math.ceil((targetCount - currentCount) / 10);
            setInvoiceCount(currentCount);
            setTimeout(incrementCount, 50);
          } else {
            setInvoiceCount(targetCount);
          }
        };
        incrementCount();
        setLogs((prev) => [
          ...prev,
          `📊 Tìm thấy ${targetCount} hóa đơn để xuất`,
        ]);
      } else {
        setLogs((prev) => [...prev, exportLogs[i]]);
      }
    }

    setIsExporting(false);
    setExportComplete(true);

    // Simulate file download
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "#";
      link.download = "goi_xuat_hoa_don.zip";
      link.click();
    }, 1000);
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      {/* Background Effects */}
      <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section with Animated Text */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Công Cụ Xuất Hóa Đơn
          </h2>
        </div>

        <div className="grid xl:grid-cols-2 gap-12 items-start">
          {/* Input Form Card */}
          <InputForm />

          <Terminal className="w-ful">
            <TypingAnimation>&gt; pnpm dlx shadcn@latest init</TypingAnimation>

            <AnimatedSpan className="text-green-500">
              ✔ Preflight checks.
            </AnimatedSpan>

            <AnimatedSpan className="text-green-500">
              ✔ Validating Tailwind CSS.
            </AnimatedSpan>

            <TypingAnimation className="text-muted-foreground">
              Success! Project initialization completed.
            </TypingAnimation>
          </Terminal>
        </div>
      </div>
    </section>
  );
}

