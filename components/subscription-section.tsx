'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function SubscriptionSection() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      // Mock subscription data
      if (data.user) {
        setSubscription({
          plan: "Pro",
          status: "Active",
          endDate: "2025-12-31",
        });
      } else {
        setSubscription(null);
      }
    };
    getUser();
  }, [supabase.auth]);

  const handleManageSubscription = async () => {
    // This would redirect to a Stripe or other payment provider portal
    alert("Redirecting to subscription management...");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý gói dịch vụ</CardTitle>
        <CardDescription>
          Xem và quản lý gói dịch vụ của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Gói hiện tại: {subscription.plan}</h3>
              <p className="text-muted-foreground">Trạng thái: {subscription.status}</p>
              <p className="text-muted-foreground">Ngày hết hạn: {subscription.endDate}</p>
            </div>
            <Button onClick={handleManageSubscription}>Quản lý gói dịch vụ</Button>
          </div>
        ) : (
          <div>
            <p>Bạn chưa đăng ký gói dịch vụ nào.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
