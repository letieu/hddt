import { getListOfPosts } from "@/lib/mdx";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BlogPage() {
  const posts = await getListOfPosts();

  return (
    <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
      <h1 className="text-5xl font-bold mb-12 text-center">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block transform transition-transform duration-300 hover:scale-105 no-underline"
          >
            <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {post.metadata.title?.toString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {post.metadata.description?.toString()}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <p className="text-base text-gray-500">
                  {new Date(
                    post.metadata.date?.toString() || "",
                  ).toLocaleDateString()}
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
