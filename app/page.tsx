import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";
import { FileSpreadsheet, FolderDown } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Quick Navigation Section */}
      <section className="relative py-20 px-4 overflow-hidden" id="app">
        <DotPattern width={20} height={20} cx={1} cy={1} cr={1} />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text">
              Tải dữ liệu hóa đơn
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link href="/tai-hoa-don/danh-sach" scroll={false}>
              <div className="relative cursor-pointer rounded-xl p-6 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <BorderBeam
                    size={120}
                    duration={8}
                    colorFrom="#3b82f6"
                    colorTo="#8b5cf6"
                    borderWidth={2}
                  />
                </div>
                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
                    <FileSpreadsheet className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Tải danh sách hóa đơn
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Xuất Excel, HTML, XML hóa đơn
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/tai-hoa-don/hoa-don-goc" scroll={false}>
              <div className="relative cursor-pointer rounded-xl p-6 border-2 border-pink-500 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <BorderBeam
                    size={120}
                    duration={8}
                    colorFrom="#ec4899"
                    colorTo="#f59e0b"
                    borderWidth={2}
                  />
                </div>
                <div className="relative flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 shadow-lg shadow-pink-500/50">
                    <FolderDown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                      Tải hóa đơn gốc
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tải file PDF hóa đơn gốc
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex justify-center text-center mt-16">
            <Link href="#contact">
              <ShimmerButton className="shadow-2xl text-white dark:text-accent-foreground">
                Cần hỗ trợ -&gt; liên hệ ngay
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <PricingSection />
    </main>
  );
}
