"use client";

import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { CreditCountButton } from "./credit-count-button";
import { DialogTitle } from "./ui/dialog";

const links = [
  { href: "/dashboard", label: "Credit" },
  { href: "/#app", label: "Tải hóa đơn" },
  { href: "/mst", label: "Tra mã số thuế" },
  { href: "/lap-to-khai-thue", label: "Lập tờ khai" },
];

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2">
      <div className="container flex h-16 items-center mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image width={60} height={60} src={"/logo.png"} alt="HD" />
          </div>
          <span className="text-xl font-bold text-foreground">Tải hóa đơn</span>
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

        <div className="flex items-center justify-end space-x-4 ml-auto md:ml-0">
          <div className="hidden md:flex items-center space-x-4">
            <CreditCountButton />
            <AuthButton />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <DialogTitle>
                  <div className="p-2">
                    <AuthButton />
                  </div>
                </DialogTitle>
                <div className="flex flex-col space-y-6 pt-6">
                  <nav className="flex flex-col space-y-3 px-2">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "text-muted-foreground hover:text-accent transition-colors text-base",
                          { "text-accent": pathname === link.href },
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex flex-col space-y-4 pt-6 border-t px-1">
                    <CreditCountButton className="w-full justify-center" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
