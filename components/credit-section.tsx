import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react"; // Added Sparkles and CheckCircle2

type CreditOption = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  isPopular?: boolean;
};
const creditOptions: CreditOption[] = [
  {
    id: "a1",
    name: "Gói A1",
    credits: 100,
    price: 100000, // Numeric price
    description: "Phù hợp cho nhu cầu sử dụng thông thường.",
    isPopular: false,
  },
  {
    id: "a2",
    name: "Gói A2",
    credits: 500,
    price: 450000, // Numeric price
    description: "Tiết kiệm hơn với gói tín dụng lớn.",
    isPopular: true,
  },
  {
    id: "a3",
    name: "Gói A3",
    credits: 1000,
    price: 800000, // Numeric price
    description: "Tối ưu chi phí cho người dùng chuyên nghiệp.",
    isPopular: false,
  },
];

export function CreditSection() {
  const supabase = createClient();
  const [creditCount, setCreditCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<CreditOption>();

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("credits")
          .select("credit_count")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setCreditCount(data.credit_count);
        }
      }
    };

    fetchData();
  }, [supabase]);

  const handlePaymentConfirmation = () => {
    if (!selectedOption) {
      alert("Vui lòng chọn một gói tín dụng để nạp.");
      return;
    }
    alert(
      `Bạn đã chọn gói ${selectedOption.name}. Chúng tôi sẽ xác nhận thanh toán và cập nhật tín dụng của bạn trong thời gian sớm nhất.`,
    );
    // In a real application, you would have a webhook from your payment provider
    // to automatically update the credit count. This is a simulation.
  };

  const qrLink = useMemo(() => {
    if (!selectedOption) return "/placeholder.svg";
    if (!user) return "/placeholder.svg";

    const baseUrl = "https://img.vietqr.io/image/VCB-9335581402-compact.png";

    const urlQuery = new URLSearchParams({
      amount: selectedOption.price.toString(),
      addInfo: getPaymentText(selectedOption.id, user.id),
    });
    return baseUrl + "?" + urlQuery.toString();
  }, [user, selectedOption]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Quản lý tín dụng</CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          Xem số dư tín dụng hiện tại và nạp thêm để tiếp tục sử dụng dịch vụ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">
            Tín dụng hiện tại của bạn
          </h3>
          <p className="text-6xl font-extrabold tracking-tight">
            {creditCount}
          </p>
          <p className="text-sm mt-2 opacity-80">Tín dụng khả dụng</p>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Chọn gói tín dụng</h3>
          <p className="text-muted-foreground mb-6">
            Nạp thêm tín dụng để mở khóa nhiều tính năng hơn và tiết kiệm chi
            phí.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {creditOptions.map((option) => (
              <Card
                key={option.id}
                className={`relative flex flex-col justify-between p-6 border-2 ${selectedOption?.id === option.id ? "border-blue-500 shadow-lg" : "border-gray-200"} hover:border-blue-400 transition-all duration-300 cursor-pointer`}
                onClick={() => setSelectedOption(option)}
              >
                {option.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Phổ biến nhất
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    {option.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-extrabold mb-2">
                    {option.credits}{" "}
                    <span className="text-xl font-semibold text-muted-foreground">
                      tín dụng
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {formatPrice(option.price)}
                  </p>
                </CardContent>
                <Button
                  className="w-full mt-4"
                  variant={
                    selectedOption?.id === option.id ? "default" : "outline"
                  }
                >
                  {selectedOption?.id === option.id
                    ? "Đã chọn"
                    : "Chọn gói này"}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {selectedOption && (
          <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md">
            <h3 className="text-xl font-bold mb-4 text-center">
              Chi tiết thanh toán cho gói {selectedOption.name}
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <p className="font-semibold text-lg mb-2">
                  Chuyển khoản ngân hàng
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Ngân hàng:</span> Vietcombank
                  </p>
                  <p>
                    <span className="font-medium">Số tài khoản:</span>{" "}
                    1234567890
                  </p>
                  <p>
                    <span className="font-medium">Chủ tài khoản:</span> NGUYEN
                    VAN A
                  </p>
                  <p>
                    <span className="font-medium">Nội dung chuyển khoản:</span>{" "}
                    {getPaymentText(selectedOption.id, user.id)}
                  </p>
                  <p className="text-blue-600 font-semibold mt-2">
                    Số tiền cần chuyển: {formatPrice(selectedOption.price)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="font-semibold text-lg mb-2">Hoặc quét mã QR</p>
                <div
                  className="mt-2 border p-2 rounded-md bg-white flex items-center justify-center"
                  style={{ minWidth: "180px", minHeight: "180px" }}
                >
                  <Image src={qrLink} alt="QR Code" width={300} height={300} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Quét mã để thanh toán nhanh chóng.
                </p>
              </div>
            </div>
            <Button
              onClick={handlePaymentConfirmation}
              className="mt-8 w-full text-lg py-3"
            >
              Tôi đã thanh toán gói {selectedOption.name}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Vui lòng chuyển khoản đúng số tiền và nội dung để giao dịch được
              xử lý nhanh nhất.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getUniqueId(userId: string): string {
  return `${userId.substring(0, 4)}${userId.substring(userId.length - 4, userId.length)}`;
}

function getPaymentText(optionId: string, userId: string): string {
  return `NAP CREDIT ${optionId.toUpperCase()} ${getUniqueId(userId)}`;
}
