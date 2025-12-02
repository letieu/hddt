import { blogPosts } from "@/lib/mdx";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://taihoadon.online",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },

    {
      url: "https://taihoadon.online/lap-to-khai-thue",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://taihoadon.online/tai-hoa-don-goc",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://taihoadon.online/hoa-don-tien-dien-evn",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://taihoadon.online/blog",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: "https://taihoadon.online/dashboard",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.2,
    },
    // 👇 Add dynamic blog post URLs
    ...blogPosts.map((slug) => ({
      url: `https://taihoadon.online/blog/${slug}`,
      lastModified: new Date(), // ideally use post.updatedAt
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
