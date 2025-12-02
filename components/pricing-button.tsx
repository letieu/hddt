"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

interface PricingButtonProps {
  planName: string;
  isCustom: boolean;
  isPopular: boolean;
}

export function PricingButton({
  planName,
  isCustom,
  isPopular,
}: PricingButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
    setRedirectTo(window.location.href);
  }, [supabase]);

  const handlePurchaseClick = () => {
    if (isCustom) {
      window.open("https://forms.gle/TCfru4HTDuxoVw277", "_blank");
      return;
    }

    if (loading) {
      return;
    }

    if (user) {
      router.push("/dashboard");
    } else {
      setShowLoginPopup(true);
    }
  };

  return (
    <Dialog open={showLoginPopup} onOpenChange={setShowLoginPopup}>
      <DialogTrigger asChild>
        <Button
          onClick={handlePurchaseClick}
          className={`w-full mt-auto ${
            isPopular
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isCustom ? "Liên hệ" : "Mua ngay"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đăng nhập/đăng ký</DialogTitle>
        </DialogHeader>
        <Auth
          localization={{
            variables: {
              sign_in: {
                email_label: "Emal",
                password_label: "Mật khẩu",
                email_input_placeholder: "Email",
                password_input_placeholder: "Mật khẩu",
                button_label: "Đăng nhập",
                loading_button_label: "Đăng nhập ...",
                social_provider_text: "Đăng nhập với google",
                link_text: "Đã có tài khỏan?, đăng nhập",
              },
              sign_up: {
                email_label: "Emal",
                password_label: "Mật khẩu",
                email_input_placeholder: "Email",
                password_input_placeholder: "Mật khẩu",
                button_label: "Đăng ký",
                loading_button_label: "Đăng ký ...",
                social_provider_text: "Đăng nhập với google",
                link_text: "Chưa có tài khỏan, đăng ký",
                confirmation_text: "Kiểm tra email để lấy link xác nhận",
              },
              forgotten_password: {
                email_label: "Emal",
                password_label: "Mật khẩu",
                email_input_placeholder: "Email",
                button_label: "Xác nhận",
                loading_button_label: "Xác nhận ...",
                link_text: "Quên mật khẩu",
                confirmation_text: "Kiểm tra email để lấy link xác nhận",
              },
              update_password: {
                password_label: "Mật khẩu",
                button_label: "Xác nhận",
                loading_button_label: "Xác nhận ...",
                confirmation_text: "Kiểm tra email để lấy link xác nhận",
              },
            },
          }}
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          socialLayout="vertical"
          redirectTo={redirectTo}
        />
      </DialogContent>
    </Dialog>
  );
}
