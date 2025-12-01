import Link from "next/link";
import Image from "next/image";
import { getListOfPosts } from "@/lib/mdx";

export async function Footer() {
  const posts = (await getListOfPosts()).slice(0, 6);

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
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
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">
              Sản phẩm
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Tải hóa đơn điện tử
                </Link>
              </li>

              <li>
                <Link
                  href="/lap-to-khai-thue"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Lập tờ khai thuế
                </Link>
              </li>
              <li>
                <Link
                  href="/tai-hoa-don-goc"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Tải hóa đơn gốc
                </Link>
              </li>
              <li>
                <Link
                  href="/hoa-don-tien-dien-evn"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Hóa đơn tiền điện EVN
                </Link>
              </li>
              <li>
                <Link
                  href="/tra-cuu-ma-so-thue"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Tra MST hàng loạt
                </Link>
              </li>
            </ul>
          </div>

          {/* Blog Link */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Blog</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Tất cả bài viết
                </Link>
              </li>
            </ul>
          </div>

          {/* Latest Blog Posts */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">
              Bài viết mới nhất
            </h3>
            <ul className="space-y-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}/`}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {post.metadata.title?.toString()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links and Support */}
          <div id="contact">
            <h3 className="font-semibold text-card-foreground mb-4">
              Phản hồi
            </h3>

            <ul className="flex flex-wrap items-center gap-4">
              <Link
                href="https://t.me/tieu_exe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                Telegram
              </Link>
            </ul>

            <div className="mt-2">
              <Link
                href="https://forms.gle/TCfru4HTDuxoVw277"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2"
              >
                Gửi phản hồi, đánh giá, yêu cầu
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center p-2 border rounded-lg bg-background shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-1">
              Zalo Hỗ trợ
            </p>
            <Image
              src="https://qr-talk.zdn.vn/2/859266887/3facd4fd7ba992f7cbb8.jpg"
              alt="Zalo QR Code"
              width={120} // Adjusted size for better fit
              height={120} // Adjusted size for better fit
              className="rounded-md"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-4 text-center">
          <p className="text-muted-foreground">
            © 2024 taihoadon.online . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
