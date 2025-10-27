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
    price: 49_000,
    description: "Mua theo lượt tải, không giới hạn MST",
    features: ["50 credits", "(≈) 10 lượt xuất file", "Không giới hạn MST"],
    popular: false,
  },
  {
    name: "Gói A2",
    price: 149_000,
    description: "Mua theo lượt tải, không giới hạn MST",
    features: ["200 credits", "(≈) 40 lượt xuất file", "Không giới hạn MST"],
    popular: false,
  },
  {
    name: "Gói A3",
    price: 449_000,
    description: "Trọn đời, không giới hạn số lần",
    features: ["Không giới hạn số lần", "Không giới hạn MST"],
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Bảng giá credit linh hoạt
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Chọn gói credit phù hợp với nhu cầu của bạn. Credit không hết hạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
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
                    Giảm giá
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
                <CardDescription className="mt-2 text-pretty h-12 text-xl">
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
                  isCustom={false}
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
