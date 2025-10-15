import { Search, Smile, Table } from "lucide-react";
import { Downloader } from "../../components/hoadongoc/downloader";

export const metadata = {
  title: "Tra cứu hoá đơn điện tử",
  description:
    "Công cụ tra cứu hoá đơn điện tử từ trang web của Tổng cục Thuế. Hỗ trợ tìm kiếm hoá đơn mua vào, bán ra.",
};

export default function TaiHoaDonGocPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Tra cứu hoá đơn điện tử
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Nhanh chóng và dễ dàng tra cứu hoá đơn điện tử trực tiếp từ hệ
                thống của Tổng cục Thuế.
              </p>

              <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-primary" />
                  <span>Giao diện dễ dàng sử dụng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Tìm kiếm hoá đơn mua vào, bán ra</span>
                </div>
                <div className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-primary" />
                  <span>Hiển thị kết quả dạng bảng</span>
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
