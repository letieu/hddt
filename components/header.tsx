"use client";

import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coins, CoinsIcon, Wallet } from "lucide-react";
import { RainbowButton } from "./magicui/rainbow-button";

export function Header() {
  const supabase = createClient();
  const [creditCount, setCreditCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { data, error } = await supabase
          .from("credits")
          .select("credit_count")
          .single();

        if (data) {
          setCreditCount(data.credit_count);
        }
      }
    };

    fetchCredits();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image width={60} height={60} src={"/logo.png"} alt="HD" />
          </div>
          <span className="text-xl font-bold text-foreground">Tải hóa đơn</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 mx-auto">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Tính năng
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Bảng giá
          </Link>
          <Link
            href="#testimonials"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Giới thiệu
          </Link>
          <Link
            href="#contact"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Liên hệ
          </Link>
        </nav>

        <div className="flex items-center justify-end space-x-4">
          {isLoggedIn && (
            <Link href="/dashboard">
              <RainbowButton>
                <span className="pl-2">{creditCount}</span>
                <Wallet />
              </RainbowButton>
            </Link>
          )}
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
