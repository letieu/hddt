"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function InstallExtensionBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isBannerClosed = localStorage.getItem("installExtensionBannerClosed");
    if (!isBannerClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("installExtensionBannerClosed", "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="pr-16 sm:text-center sm:px-16">
          <p className="font-medium">
            <span className="md:hidden">
              Lo ngại về bảo mật, tải hóa đơn hàng với extension.
            </span>
            <span className="hidden md:inline">
              Lo ngại về bảo mật, tải hóa đơn hàng với extension.
            </span>
            <span className="block sm:ml-2 sm:inline-block">
              <Link
                href="/blog/tai-hoa-don-extension"
                className="font-bold bg-gradient-to-r from-yellow-300 to-orange-500 bg-clip-text text-transparent"
              >
                {" "}
                Tìm hiểu thêm <span aria-hidden="true">&rarr;</span>
              </Link>
            </span>
          </p>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-start pt-1 pr-1 sm:pt-1 sm:pr-2 sm:items-start">
          <button
            type="button"
            className="flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={handleClose}
          >
            <span className="sr-only">Bỏ qua</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
