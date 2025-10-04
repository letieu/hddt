"use client";

import { usePathname, useRouter } from "next/navigation";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { FileSpreadsheet, FolderDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export default function TaiHoaDonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isInvoiceList = pathname === "/tai-hoa-don/danh-sach";
  const isOriginalInvoice = pathname === "/tai-hoa-don/hoa-don-goc";

  return (
    <section className="relative py-20 px-4 overflow-hidden" id="app">
      <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Tải dữ liệu hóa đơn
          </h2>
        </div>

        {/* Beautiful Feature Selector */}
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Link href="/tai-hoa-don/danh-sach" scroll={false}>
              <div
                className={cn(
                  "relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ease-out",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isInvoiceList
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 shadow-lg scale-[1.02]"
                    : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700"
                )}
              >
                {isInvoiceList && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <BorderBeam
                      size={100}
                      duration={8}
                      colorFrom="#3b82f6"
                      colorTo="#8b5cf6"
                      borderWidth={2}
                    />
                  </div>
                )}
                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                      isInvoiceList
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50"
                        : "bg-muted"
                    )}
                  >
                    <FileSpreadsheet
                      className={cn(
                        "h-6 w-6 transition-colors duration-200",
                        isInvoiceList ? "text-white" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "text-base font-bold mb-0.5 transition-all duration-200",
                        isInvoiceList
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                          : "text-foreground"
                      )}
                    >
                      Tải danh sách hóa đơn
                    </h3>
                    <p className="text-xs text-muted-foreground transition-opacity duration-200">
                      Xuất Excel, HTML, XML
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/tai-hoa-don/hoa-don-goc" scroll={false}>
              <div
                className={cn(
                  "relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ease-out",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isOriginalInvoice
                    ? "border-pink-500 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 shadow-lg scale-[1.02]"
                    : "border-border bg-card hover:border-pink-300 dark:hover:border-pink-700"
                )}
              >
                {isOriginalInvoice && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <BorderBeam
                      size={100}
                      duration={8}
                      colorFrom="#ec4899"
                      colorTo="#f59e0b"
                      borderWidth={2}
                    />
                  </div>
                )}
                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
                      isOriginalInvoice
                        ? "bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg shadow-pink-500/50"
                        : "bg-muted"
                    )}
                  >
                    <FolderDown
                      className={cn(
                        "h-6 w-6 transition-colors duration-200",
                        isOriginalInvoice ? "text-white" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "text-base font-bold mb-0.5 transition-all duration-200",
                        isOriginalInvoice
                          ? "bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent"
                          : "text-foreground"
                      )}
                    >
                      Tải hóa đơn gốc
                    </h3>
                    <p className="text-xs text-muted-foreground transition-opacity duration-200">
                      Tải file PDF hóa đơn gốc
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        {children}

        <div className="flex justify-center text-center mt-16">
          <Link href="#contact">
            <ShimmerButton className="shadow-2xl text-white dark:text-accent-foreground">
              Cần hỗ trợ -&gt; liên hệ ngay
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
