import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image width={60} height={60} src={"/logo.png"} alt="HD" />
          </div>
          <span className="text-xl font-bold text-foreground">Tải hóa đơn</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 mx-auto">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Tính năng
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Bảng giá
          </Link>
          <Link
            href="#testimonials"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Giới thiệu
          </Link>
          <Link
            href="#contact"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            Liên hệ
          </Link>
        </nav>

        <AuthButton />
      </div>
    </header>
  );
}
