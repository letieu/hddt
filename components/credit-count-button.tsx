"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RainbowButton } from "./magicui/rainbow-button";
import { Wallet } from "lucide-react";
import Link from "next/link";

export function CreditCountButton({ className }: { className?: string }) {
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
    isLoggedIn && (
      <Link href="/dashboard">
        <RainbowButton className={className}>
          <span className="pl-2">{creditCount}</span>
          <Wallet />
        </RainbowButton>
      </Link>
    )
  );
}
