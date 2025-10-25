import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "../../lib/posts";

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">博客</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="p-6 border rounded-lg bg-white/60 flex flex-col">
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={post.meta.cover || '/images/default-cover.svg'}
                alt={post.meta.title}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.meta.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-500 mb-3">{post.meta.date}</p>
            <p className="text-slate-700">{post.meta.description}</p>
            <div className="mt-auto pt-4">
              <Link href={`/blog/${post.slug}`} className="text-sky-600 hover:underline">
                阅读更多 →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
