'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Image from "next/image";

export function CreditSection() {
  const supabase = createClient();
  const [creditCount, setCreditCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('credits')
          .select('credit_count')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setCreditCount(data.credit_count);
        }
      }
    };

    fetchData();
  }, [supabase]);

  const handlePaymentConfirmation = () => {
    // In a real application, you would have a webhook from your payment provider
    // to automatically update the credit count. This is a simulation.
    alert("Chúng tôi sẽ xác nhận thanh toán và cập nhật tín dụng của bạn trong thời gian sớm nhất.");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quản lý tín dụng</CardTitle>
        <CardDescription>
          Xem và nạp thêm tín dụng để sử dụng dịch vụ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Tín dụng hiện tại</h3>
          <p className="text-4xl font-bold">{creditCount}</p>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Nạp thêm tín dụng</h3>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="font-semibold">Chuyển khoản ngân hàng</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Ngân hàng: Vietcombank</p>
                <p>Số tài khoản: 1234567890</p>
                <p>Chủ tài khoản: NGUYEN VAN A</p>
                <p>Nội dung: NAP CREDIT {user?.id}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-semibold">Hoặc quét mã QR</p>
              <div className="mt-2">
                <Image src="/placeholder.svg" alt="QR Code" width={150} height={150} />
              </div>
            </div>
          </div>
          <Button onClick={handlePaymentConfirmation} className="mt-6 w-full">
            Tôi đã thanh toán
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
