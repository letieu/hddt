import { getListOfPosts } from "@/lib/mdx";
import Link from "next/link";

export default async function BlogPage() {
  const posts = await getListOfPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {post.metadata.title?.toString()}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
