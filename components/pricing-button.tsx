"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface PricingButtonProps {
  planName: string;
  isCustom: boolean;
  isPopular: boolean;
}

export function PricingButton({ planName, isCustom, isPopular }: PricingButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, [supabase]);

  const handlePurchaseClick = () => {
    if (isCustom) {
      alert(
        "Vui lòng liên hệ với chúng tôi để được tư vấn về gói Doanh nghiệp."
      );
      return;
    }

    if (loading) {
      return;
    }

    if (user) {
      router.push("/dashboard");
    } else {
      alert("Vui lòng đăng nhập để mua credit.");
    }
  };

  return (
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
  );
}