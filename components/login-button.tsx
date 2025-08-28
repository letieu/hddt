"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function LoginButton() {
  const supabase = createClient();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">Đăng nhập</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đăng nhập</DialogTitle>
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
                button_label: "Đăng ký",
                loading_button_label: "Đăng ký ...",
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
        />
      </DialogContent>
    </Dialog>
  );
}
