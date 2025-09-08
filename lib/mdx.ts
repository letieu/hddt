import type { Metadata } from "next/types";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const blogPosts = ["huong-dan-tra-cuu-thong-tin-thue"];
  const blogStaticParams = blogPosts.map((post) => ({
    slug: post,
  }));

  return blogStaticParams;
}

export type PostMetadata = Metadata & {
  title: string;
  description: string;
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
