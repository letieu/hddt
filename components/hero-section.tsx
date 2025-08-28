import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Cloud,
  Download,
  File,
  FileOutput,
  FileSpreadsheet,
  FileX,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Xuất Dữ Liệu Hóa Đơn Điện Tử{" "}
            <span className="text-accent">Hàng Loạt</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Xuất hàng nghìn hóa đơn điện tử trong khoảng thời gian rộng chỉ
            trong một cú nhấp chuột. Nhận gói dữ liệu hoàn chỉnh với file{" "}
            <strong>Excel</strong> và <strong>XML</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#app">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 group cursor-pointer"
              >
                Bắt Đầu Xuất Dữ Liệu
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="group bg-white cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Xem file demo
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <span>Không cần cài đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Tải xuống ngay lập tức</span>
            </div>
            <div className="flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-primary" />
              <span>Xuất hàng nghìn hóa đơn</span>
            </div>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="bg-card rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg p-8 text-left">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                Kết quả bao gồm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded-full">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Danh sách hóa đơn bán ra
                    </p>
                    <p className="text-muted-foreground">
                      File excel danh sách hóa đơn bán ra
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Danh sách hóa đơn mua vào
                    </p>
                    <p className="text-muted-foreground">
                      File excel danh sách hóa đơn mua vào
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 rounded-full">
                    <FileX className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      File XML theo hóa đơn
                    </p>
                    <p className="text-muted-foreground">
                      Toàn bộ file XML kèm theo danh sách hóa đơn
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 rounded-full">
                    <File className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      File HTML theo hóa đơn
                    </p>
                    <p className="text-muted-foreground">
                      Toàn bộ file HTML kèm theo danh sách hóa đơn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
