"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Cloud,
  Download,
  File,
  FileOutput,
  FileSpreadsheet,
  FileX,
  MessageCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import Image from "next/image";

export function HeroSection() {
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Tải Hóa Đơn Điện Tử <span className="text-accent">Hàng Loạt</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Tải hàng nghìn hóa đơn điện tử chỉ trong một cú nhấp chuột. Nhận gói
            dữ liệu hoàn chỉnh với file <strong>Excel</strong> và{" "}
            <strong>XML</strong>, <strong>PDF</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#app">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 group cursor-pointer"
              >
                Bắt Đầu Tải Dữ Liệu
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="group bg-white cursor-pointer"
              onClick={() => setShowDemoPopup(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Xem file demo
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <span>Không cần cài đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <FileOutput className="h-5 w-5 text-primary" />
              <span>Tải toàn bộ hóa đơn, không giới hạn ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Tối ưu tốc độ tải xuống</span>
            </div>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg p-8 text-left">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                Kết quả bao gồm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded-full">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Danh sách hóa đơn
                    </p>
                    <p className="text-muted-foreground">
                      File excel list hóa đơn bán ra, mua vào, hóa đơn có mã từ
                      máy tính tiền
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 rounded-full">
                    <FileX className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      File XML, HTML, PDF theo hóa đơn
                    </p>
                    <p className="text-muted-foreground">
                      Toàn bộ file kèm theo danh sách hóa đơn
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 rounded-full">
                    <Box className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Danh sách sản phẩm, bảng kê hoá đơn
                    </p>
                    <p className="text-muted-foreground">
                      Kèm theo danh sách sản phẩm trong file excel, bảng kê hoá
                      đơn, chứng từ hàng hoá, dịch vụ mua vào, bán ra
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 rounded-full">
                    <File className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Định dạng để dễ dàng nhập vào các phần mềm kế toán như
                      Misa
                    </p>
                    <p className="text-muted-foreground">
                      File Excel được định dạng để dễ dàng nhập vào các phần mềm
                      kế toán như Misa hoặc Tạo bảng kê, tờ khai thuế.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={showDemoPopup} onOpenChange={setShowDemoPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              File demo
            </AlertDialogTitle>
            <div>
              <p>Dưới đây là các file demo để bạn có thể xem trước kết quả.</p>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href="https://docs.google.com/spreadsheets/d/1blcRYKM6-ZT0YU0vLSGm2zYGhECQPGFAIVtDSa4j-Nk/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  1. Google Sheet - Danh sách hóa đơn
                </a>
                <br />
                <a
                  href="https://drive.google.com/drive/folders/1E_JWnm7GR1xPyVgXlo6IZldz6XAKdJMc?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  2. Google Drive - File ZIP chứa XML/HTML
                </a>
              </div>
              <p className="mt-4 text-sm text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ Nếu file demo không đáp ứng đủ,{" "}
                <button
                  onClick={() => {
                    setShowDemoPopup(false);
                    setShowContactPopup(true);
                  }}
                  className="underline text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  liên hệ
                </button>{" "}
                để được hỗ trợ ngay
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDemoPopup(false)}>
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Dialog */}
      <AlertDialog open={showContactPopup} onOpenChange={setShowContactPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageCircle className="text-blue-500" />
              Liên hệ hỗ trợ
            </AlertDialogTitle>
            <div className="text-center">
              <p className="mb-4">Quét mã QR để liên hệ qua Zalo</p>
              <div className="flex justify-center">
                <div className="flex flex-col items-center p-4 border rounded-lg bg-background shadow-sm">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Zalo Hỗ trợ
                  </p>
                  <Image
                    src="https://qr-talk.zdn.vn/2/859266887/3facd4fd7ba992f7cbb8.jpg"
                    alt="Zalo QR Code"
                    width={200}
                    height={200}
                    className="rounded-md"
                  />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Hoặc{" "}
                <a
                  href="https://t.me/tieu_exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  liên hệ qua Telegram
                </a>
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowContactPopup(false)}>
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
