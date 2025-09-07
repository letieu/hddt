"use client";

import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet } from "lucide-react";
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
        const { data } = await supabase
          .from("credits")
          .select("credit_count")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setCreditCount(data.credit_count);
        }
      } else {
        setCreditCount(0);
      }
    };

    fetchCredits();

    const handleCreditUpdate = () => fetchCredits();
    window.addEventListener("credit-update", handleCreditUpdate);

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchCredits();
    });

    const channel = supabase
      .channel("credit-changes-main-header")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "credits" },
        () => {
          fetchCredits();
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("credit-update", handleCreditUpdate);
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image width={60} height={60} src={"/logo.png"} alt="Tải hóa đơn logo" />
          </div>
          <span className="text-xl font-bold text-foreground">Tải hóa đơn</span>
        </Link>

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
