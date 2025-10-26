"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Bot, Clock, DownloadCloud, FileSpreadsheet, Zap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ContactPopup } from "@/components/contact-popup";

export default function EvnInvoicePage() {
  const [showContactPopup, setShowContactPopup] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Tải hóa đơn tiền điện EVN hàng loạt
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Giúp tải hóa đơn tiền điện tự động số lượng lớn, thay vì phải tra
            cứu từng hóa đơn, giải nén từng file, mất thời gian, dễ nhầm lẫn.
          </p>
          <Button
            size="lg"
            className="text-lg bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowContactPopup(true)}
          >
            <Zap className="mr-2 h-5 w-5" /> Yêu cầu Demo Ngay
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Tính năng nổi bật</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Những gì chúng tôi mang lại để giúp bạn
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-green-100 text-green-600 p-3 rounded-full w-fit">
                <Bot className="h-8 w-8" />
              </div>
              <CardTitle className="mt-4">Tự động hóa hoàn toàn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Hệ thống tự động đăng nhập, tra cứu và tải về toàn bộ hóa đơn
                tiền điện từ trang của EVN.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-yellow-100 text-yellow-600 p-3 rounded-full w-fit">
                <Clock className="h-8 w-8" />
              </div>
              <CardTitle className="mt-4">Tiết kiệm thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Giải phóng bạn khỏi công việc thủ công tẻ nhạt, tiết kiệm hàng
                giờ làm việc mỗi tháng.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-red-100 text-red-600 p-3 rounded-full w-fit">
                <Zap className="h-8 w-8" />
              </div>
              <CardTitle className="mt-4">Chính xác và Tin cậy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Giảm thiểu 100% sai sót và nhầm lẫn so với việc tải và giải nén
                thủ công từng file.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Hoạt động như thế nào?</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Quy trình 3 bước đơn giản</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-600"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="text-center relative">
                <div className="relative z-10 mx-auto bg-white dark:bg-gray-800 border-2 border-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mt-6">Bước 1</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Nhập danh sách tài khoản EVN từ file Excel</p>
              </div>
              <div className="text-center relative">
                <div className="relative z-10 mx-auto bg-white dark:bg-gray-800 border-2 border-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mt-6">Bước 2</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Hệ thống tự động tải và xử lý dữ liệu</p>
              </div>
              <div className="text-center relative">
                <div className="relative z-10 mx-auto bg-white dark:bg-gray-800 border-2 border-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
                  <DownloadCloud className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mt-6">Bước 3</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Nhận file hóa đơn đã được sắp xếp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Giao diện trực quan</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Dễ dàng sử dụng và theo dõi tiến trình
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Image
            src="/evndownload.png"
            alt="Giao diện tải hóa đơn EVN"
            width={1920}
            height={1080}
            className="rounded-lg shadow-2xl"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Sẵn sàng để tự động hóa?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Liên hệ với chúng tôi ngay hôm nay để nhận bản demo và trải nghiệm sự
          tiện lợi.
        </p>
        <Button
          size="lg"
          className="text-lg"
          onClick={() => setShowContactPopup(true)}
        >
          <Zap className="mr-2 h-5 w-5" /> Liên hệ ngay
        </Button>
      </section>

      <ContactPopup open={showContactPopup} onOpenChange={setShowContactPopup} />
    </>
  );
}
