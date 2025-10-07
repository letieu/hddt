import { RainbowButton } from "@/components/magicui/rainbow-button";
import { ArrowRight, Bot, Cloud, Smile } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Lập tờ khai thuế online",
  description:
    "Công cụ hỗ trợ lập tờ khai thuế, quản lý tờ khai online, với giao diện dễ dàng và AI hỗ trợ kê khai. Tải file XML, Excel, DOCX, PDF.",
};

export default function LapToKhaiThue() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Lập tờ khai thuế online
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Công cụ hỗ trợ lập tờ khai thuế, quản lý tờ khai online, với
                giao diện dễ dàng và AI hỗ trợ kê khai. Tải file XML, Excel,
                DOCX, PDF.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <p className="text-center text-muted-foreground">
                  Sản phẩm đang được phát triển
                </p>
                <Link href="https://forms.gle/VxuAfMatGzr8rjcf8">
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
                  <span>Chỉnh sửa, chuyển đổi file XML qua các định dạng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>AI hỗ trợ kê khai</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
