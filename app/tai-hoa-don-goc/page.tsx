import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ArrowRight, Bot, Cloud, Smile } from "lucide-react";
import Link from "next/link";
import Downloader from "./downloader";

export const metadata = {
  title: "Tải hóa đơn gốc hàng loạt",
  description:
    "Công cụ hỗ trợ tải hóa đơn gốc hàng loạt, tải hóa đơn gốc PDF, Tải hóa đơn điện tử từ nhà cung cấp",
};

export default function TaiHoaDonGocPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Tải hóa đơn gốc hàng loạt
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Công cụ hỗ trợ tải hóa đơn gốc hàng loạt, tải hóa đơn gốc PDF từ
                nhà cung câp số lượng lớn
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <p className="text-center text-muted-foreground">
                  Sản phẩm đang được phát triển
                </p>
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfvSut4-teZqIiRfH3elG6tBqeXSSfybt2Ik7U3zkrEYErnTA/viewform?usp=header">
                  <RainbowButton>
                    <div className="ml-1">Nhận thông báo</div>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </RainbowButton>
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-primary" />
                  <span>Giao diện dễ dàng sử dụng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span>Tải hóa đơn gốc PDF từ nhà cung cấp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Tải số lượng lớn, tốc độ nhanh</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Downloader />
      </main>
    </div>
  );
}
