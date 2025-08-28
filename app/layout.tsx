import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tải hóa đơn điện tử hàng loạt",
  description: "Tải hóa đơn điện tử hàng loạt",
};

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${roboto.className}`}>
        {children}
      </body>
    </html>
  );
}
