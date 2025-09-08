import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const title = "Tải Hóa Đơn Điện Tử Hàng Loạt - Nhanh Chóng và Tự Động";
const description =
  "Xuất hóa đơn điện tử hang lóạt nhanh chóng và tự động, đầy đủ thông tin, kèo file XML bằng 1 click.";
const url = "https://taihoadon.online";
const imageUrl = `${url}/modern-dashboard-interface-with-workflow-automatio.png`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
  },
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
    <html lang="vi" suppressHydrationWarning>
      <head />
      <body className={`font-sans ${roboto.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-0YZCEZE5X0" />
    </html>
  );
}
