"use client";

import { Terminal } from "lucide-react";
import {
  InvoiceType,
  InvoiceQueryType,
} from "@/lib/download/hoadon-api";
export type { InvoiceType, InvoiceQueryType };
import { DotPattern } from "@/components/magicui/dot-pattern";

export function Downloader() {
  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Tải dữ liệu hóa đơn
          </h2>
        </div>

        <div className="grid xl:grid-cols-2 gap-12 items-start">
          <Terminal className="w-full"></Terminal>
        </div>
      </div>
    </section>
  );
}
