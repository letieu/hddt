import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { CreditCountButton } from "./credit-count-button";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "Tải hóa đơn" },
  { href: "/tai-hoa-don-goc", label: "Tải hóa đơn gốc" },
  { href: "/tra-cuu-ma-so-thue", label: "Tra MST" },
  // { href: "/hoa-don-tien-dien-evn", label: "Hóa đơn tiền điện EVN" },
  // { href: "/lap-to-khai-thue", label: "Lập tờ khai" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col md:flex-row md:h-16 items-center mx-auto px-2">
        <div className="flex items-center w-full h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Image
                width={60}
                height={60}
                src={"/logo.png"}
                alt="Tải hóa đơn logo"
              />
            </div>
            <span className="text-xl font-bold text-foreground">
              Tải hóa đơn
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 mx-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center justify-end space-x-2 md:space-x-4 ml-auto">
            <CreditCountButton />
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Nav - Bottom Row */}
        <nav className="md:hidden flex items-center justify-center w-full pb-3 space-x-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
