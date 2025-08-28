'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RainbowButton } from "./magicui/rainbow-button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { LoginButton } from "./login-button";

export function InputForm() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setIsLoggedIn(!!data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (
    <Card className="relative overflow-hidden bg-white">
      <CardHeader>
        <CardTitle>Nhập thông tin</CardTitle>
        <CardDescription>
          Sử dụng thông tin đăng nhập từ trang{" "}
          <a
            href="https://hoadondientu.gdt.gov.vn/"
            target="_blank"
            className="text-blue-500 underline"
          >
            hoadondientu.gdt.gov.vn
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex space-x-4">
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="username">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </Label>
                <Input id="username" placeholder="Tên đăng nhập" />
              </div>
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>
                Khoảng ngày <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  id="from-date"
                  disabled={!isLoggedIn}
                  min={!isLoggedIn ? formatDate(oneWeekAgo) : undefined}
                  max={!isLoggedIn ? formatDate(today) : undefined}
                />
                <span>đến</span>
                <Input
                  type="date"
                  id="to-date"
                  disabled={!isLoggedIn}
                  min={!isLoggedIn ? formatDate(oneWeekAgo) : undefined}
                  max={!isLoggedIn ? formatDate(today) : undefined}
                />
              </div>
              {!isLoggedIn && (
                <p className="text-sm text-muted-foreground">
                  <LoginButton /> để xuất dữ liệu trong khoảng thời gian dài hơn.
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="invoice-buyer">Số hoá đơn người mua</Label>
                <Input
                  id="invoice-buyer"
                  placeholder="Nhập số hoá đơn người mua"
                />
              </div>
              <div className="flex w-1/2 flex-col space-y-1.5">
                <Label htmlFor="invoice-seller">Số hoá đơn người bán</Label>
                <Input
                  id="invoice-seller"
                  placeholder="Nhập số hoá đơn người bán"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <RainbowButton className="w-full">Xuất dữ liệu</RainbowButton>
      </CardFooter>
      <BorderBeam duration={8} size={100} />
    </Card>
  );
}
