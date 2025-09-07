import { AuthButton } from "./auth-button";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { DialogTitle } from "./ui/dialog";
import { CreditCountButton } from "./credit-count-button";

const links = [
  { href: "/", label: "Tải hóa đơn" },
  { href: "/mst", label: "Tra mã số thuế" },
  { href: "/lap-to-khai-thue", label: "Lập tờ khai" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2">
      <div className="container flex h-16 items-center mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Image
              width={60}
              height={60}
              src={"/logo.png"}
              alt="Tải hóa đơn logo"
            />
          </div>
          <span className="text-xl font-bold text-foreground">Tải hóa đơn</span>
        </Link>

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
                        className="text-muted-foreground hover:text-accent transition-colors text-base"
                      >
                        {link.label}
                      </Link>
                    ))}

                    <CreditCountButton className="w-full" />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
