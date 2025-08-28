"use client";

import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/dashboard/subscription", label: "Gói dịch vụ" },
  { href: "/", label: "Tải hóa đơn" },
];

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image width={60} height={60} src={"/logo.png"} alt="HD" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Tải hóa đơn
          </span>
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
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
