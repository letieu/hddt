import { getBlogPostMetadata } from "@/lib/mdx";
import { Metadata } from "next";
import dynamic from "next/dynamic";

type BlogPageProps = { params: { slug: string } };

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { metadata } = await getBlogPostMetadata(slug);

  if (metadata) {
    return metadata;
  } else {
    throw new Error(`No metadata found for blog post: ${slug}`);
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const BlogMarkdown = dynamic(() => import("@/blog/" + slug + ".mdx"));

  return (
    <div className="container mx-auto p-4">
      <BlogMarkdown />
    </div>
  );
}
