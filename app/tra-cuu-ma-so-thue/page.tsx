"use client";
import { MstForm } from "@/components/mst-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Check, Search, FileDown, Users, LogIn } from "lucide-react";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

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

function LoginPrompt() {
  const supabase = createClient();
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Card className="max-w-3xl mx-auto text-center">
      <CardHeader>
        <CardTitle>Yêu cầu đăng nhập</CardTitle>
        <CardDescription>
          Bạn cần đăng nhập để sử dụng chức năng tra cứu mã số thuế.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleLogin}>
          <LogIn className="mr-2 h-4 w-4" /> Đăng nhập với Google
        </Button>
      </CardContent>
    </Card>
  );
}

export default function MstPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
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
              {loading ? null : user ? <MstForm /> : <LoginPrompt />}
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
      </main>
    </div>
  );
}
