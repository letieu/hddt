import { Metadata } from "next";

const title = "Tra Cứu Mã Số Thuế - Nhanh Chóng và Tự Động";
const description =
  "Tra cứu mã số thuế cá nhân, doanh nghiệp hàng loạt. Kết qủa bao gồm thông tin về tổ chức, cá nhân, và hộ kinh doanh, cơ quan thuế quản lý và trạng thái của mã số thuế.";
const url = "https://taihoadon.online";
const imageUrl = `${url}/og/tra-cuu-ma-so-thue.png`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: title,
  description: description,
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
};

export default function MstLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
