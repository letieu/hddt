"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

interface ContactPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactPopup({ open, onOpenChange }: ContactPopupProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Đóng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}