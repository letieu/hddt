import { MstForm } from "@/components/mst-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Search, FileDown, Users } from "lucide-react";
import { Metadata } from "next";

const features = [
  {
    icon: Search,
    title: "Tra cứu nhanh chóng, chính xác",
    description:
      "Sử dụng dữ liệu từ Tổng Cục Thuế, đảm bảo kết quả tra cứu mã số thuế cá nhân và doanh nghiệp luôn chính xác và cập nhật.",
  },
  {
    icon: FileDown,
    title: "Tải kết quả ra Excel",
    description:
      "Dễ dàng xuất danh sách kết quả tra cứu ra file Excel để lưu trữ, báo cáo hoặc sử dụng cho các công việc kế toán khác.",
  },
  {
    icon: Users,
    title: "Tra cứu hàng loạt không giới hạn",
    description:
      "Công cụ cho phép bạn tra cứu hàng trăm, hàng nghìn mã số thuế chỉ trong một lần, tiết kiệm thời gian và công sức tối đa.",
  },
  {
    icon: Check,
    title: "Giao diện thân thiện, dễ sử dụng",
    description:
      "Thiết kế đơn giản, trực quan giúp bạn dễ dàng thực hiện tra cứu mà không cần bất kỳ kiến thức kỹ thuật nào.",
  },
];

const title = "Tra Cứu Mã Số Thuế - Nhanh Chóng và Tự Động";
const description =
  "Tra cứu mã số thuế cá nhân, doanh nghiệp hàng loạt. Kết qủa bao gồm thông tin về tổ chức, cá nhân, và hộ kinh doanh, cơ quan thuế quản lý và trạng thái của mã số thuế.";
const url = "https://taihoadon.online";
const imageUrl = `${url}/og/tra-cuu-ma-so-thue.png`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: title,
  description: description,
  openGraph: {
    title,
    description,
    url,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function MstPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Tra Cứu Mã Số Thuế{" "}
                <span className="text-accent">Hàng Loạt</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Tra cứu mã số thuế cá nhân, doanh nghiệp hàng loạt. Kết qủa bao
                gồm thông tin về tổ chức, cá nhân, và hộ kinh doanh, cơ quan
                thuế quản lý và trạng thái của mã số thuế.
              </p>
              <MstForm />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Đơn giản, trực quan, giúp bạn dễ dàng tra cứu mã số thuế
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Công cụ tra cứ mã số thuế cá nhân, doanh nghiệp hàng loạt online
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-border hover:shadow-lg transition-shadow bg-card"
                >
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="guide" className="py-20 px-4 bg-card">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Hướng Dẫn và Thông Tin
              </h2>
            </div>
            <div className="space-y-8 text-lg text-muted-foreground">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Mã Số Thuế là gì?
                </h3>
                <p>
                  Mã số thuế (MST) là một mã số duy nhất do cơ quan thuế cấp cho
                  các tổ chức, cá nhân, và hộ kinh doanh tại Việt Nam để nhận
                  diện và quản lý việc nộp thuế. Đối với doanh nghiệp, MST cũng
                  chính là mã số doanh nghiệp. Đối với cá nhân, MST được cấp dựa
                  trên số CMND/CCCD.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Tầm quan trọng của việc tra cứu Mã Số Thuế
                </h3>
                <p>
                  Kiểm tra thông tin đối tác, khách hàng để đảm bảo tính pháp lý
                  và tránh rủi ro trong kinh doanh.
                </p>
                <p>Phục vụ công tác kế toán, kê khai và nộp thuế chính xác.</p>
                <p>Xác thực thông tin cá nhân cho các thủ tục hành chính.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
