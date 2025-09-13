import type { Metadata } from "next/types";
import { notFound } from "next/navigation";

export const blogPosts = [
  "huong-dan-tai-hoa-don-hang-loat",
  "huong-dan-tra-cuu-thong-tin-thue",
  "huong-dan-tra-cuu-hoa-don-dien-tu",
  "phat-trien-cong-cu-lap-to-khai-thue",
  "tai-hoa-don-extension",
];

export async function generateStaticParams() {
  const blogStaticParams = blogPosts.map((post) => ({
    slug: post,
  }));

  return blogStaticParams;
}

export type PostMetadata = Metadata & {
  title: string;
  description: string;
  date: string;
  image?: string;
};

export type BlogPostData = {
  slug: string;
  metadata: Metadata;
};

export async function getBlogPostMetadata(slug: string): Promise<BlogPostData> {
  try {
    const file = await import("@/blog/" + slug + ".mdx");

    if (file?.metadata) {
      if (!file.metadata.title || !file.metadata.description) {
        throw new Error(`Missing some required metadata fields in: ${slug}`);
      }

      return {
        slug,
        metadata: file.metadata,
      };
    } else {
      throw new Error(`Unable to find metadata for ${slug}.mdx`);
    }
  } catch (error: any) {
    console.error(error?.message);
    return notFound();
  }
}

export async function getListOfPosts() {
  const params = await generateStaticParams();
  return Promise.all(
    params.map(async (param) => {
      const post = await getBlogPostMetadata(param.slug);
      return post;
    }),
  );
}
