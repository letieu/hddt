"use client";

import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RainbowButton } from "./magicui/rainbow-button";
import { Wallet } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Credit" },
  { href: "/#app", label: "Tải hóa đơn" },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const supabase = createClient();
  const [creditCount, setCreditCount] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("credits")
        .select("credit_count")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setCreditCount(data.credit_count);
      }
    };

    fetchCredits();

    const handleCreditUpdate = () => fetchCredits();
    window.addEventListener("credit-update", handleCreditUpdate);

    const channel = supabase
      .channel("credit-changes-header")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "credits" },
        (payload) => {
          fetchCredits();
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("credit-update", handleCreditUpdate);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image width={60} height={60} src={"/logo.png"} alt="HD" />
          </div>
          <span className="text-xl font-bold text-foreground">Tải hóa đơn</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 mx-auto px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground hover:text-accent transition-colors",
                { "text-accent": pathname === link.href },
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end space-x-4">
          <Link href="/dashboard">
            <RainbowButton>
              <span className="pl-2">{creditCount}</span>
              <Wallet />
            </RainbowButton>
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
