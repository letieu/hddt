import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Calendar, FileSpreadsheet, Zap, Box } from "lucide-react";

const features = [
  {
    icon: Download,
    title: "Tải hàng loạt chỉ với một cú nhấp chuột",
    description:
      "Tải hàng nghìn hoá đơn điện tử hàng loạt. Không còn phải tải từng hoá đơn một - nhận tất cả trong một gói duy nhất.",
  },
  {
    icon: FileSpreadsheet,
    title: "Gói dữ liệu hoàn chỉnh",
    description:
      "Nhận cả tệp tóm tắt Excel và XML, HTML, PDF trong một lần tải xuống. Hoàn hảo cho việc kế toán, phân tích và lưu trữ hồ sơ.",
  },
  {
    icon: Calendar,
    title: "Lọc ngày linh hoạt",
    description:
      "Tải dữ liệu từ bất kỳ khoảng thời gian nào - tháng hoặc cả năm.",
  },
  {
    icon: Box,
    title: "Kèm theo chi tiết sản phẩm",
    description:
      "File Excel đã bao gồm thông tin chi tiết về sản phẩm, đơn giá, số lượng, thành tiền, ...",
  },
];

const featureColors = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
  "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400",
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Tại sao chọn công cụ tải hoá đơn điện tử của chúng tôi?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tải hóa đơn điện tử, hóa đơn khởi tạo từ máy tính tiền hàng loạt, hỗ
            trợ file excel, PDF, XML, HTML
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div
                  className={`h-12 w-12 rounded-lg ${featureColors[index % featureColors.length]} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="h-6 w-6" />
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
  );
}
