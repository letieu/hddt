export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="min-h-screen bg-background p-2 md:p-10 max-w-6xl mx-auto prose prose-quoteless dark:prose-invert prose-neutral prose-sm prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:underline prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:p-1 prose-code:rounded prose-li:marker:text-gray-500 prose-img:rounded-lg prose-img:shadow-md prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-table:w-full prose-table:border-collapse prose-table:table-auto prose-th:border prose-th:p-2 prose-th:text-left prose-td:border prose-td:p-2">
      <main>{children}</main>
    </article>
  );
}
