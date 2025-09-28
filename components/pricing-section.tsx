import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { PricingButton } from "./pricing-button";

// Helper function to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const plans = [
  {
    name: "Gói A1",
    price: 30000,
    description: "Gói nhỏ cho nhu cầu không thường xuyên.",
    features: ["50 credits", "(≈) 20 lượt xuất file", "Hỗ trợ qua email"],
    popular: false,
  },
  {
    name: "Gói A2",
    price: 50000,
    description: "Gói phổ biến, phù hợp cho hầu hết người dùng.",
    features: ["100 credits", "(≈) 50 lượt xuất file", "Hỗ trợ ưu tiên"],
    popular: false,
  },
  {
    name: "Gói A3",
    price:500000,
    description: "Trọn đời, không giới hạn số lần",
    features: ["999999999999 credits", "Không giới hạn số lần", "Hỗ trợ ưu tiên"],
    popular: true,
  },
  {
    name: "Doanh nghiệp",
    price: "Custom",
    description: "Giải pháp linh hoạt cho các doanh nghiệp lớn.",
    features: [
      "Số credit không giới hạn",
      "Tích hợp theo yêu cầu",
      "Hỗ trợ chuyên sâu",
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Bảng giá credit linh hoạt
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Chọn gói credit phù hợp với nhu cầu của bạn. Credit không hết hạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-accent shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Phổ biến nhất
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-card-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-card-foreground">
                    {typeof plan.price === "number"
                      ? formatPrice(plan.price)
                      : plan.price}
                  </span>
                </div>
                <CardDescription className="mt-2 text-pretty h-12">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 text-accent mr-3 flex-shrink-0 mt-1" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <PricingButton
                  planName={plan.name}
                  isCustom={plan.price === "Custom"}
                  isPopular={plan.popular}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
