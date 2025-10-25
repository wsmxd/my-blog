import Link from "next/link";

export default function HomePage() {
  return (
    <section className="text-center space-y-6">
      <h1 className="text-4xl font-bold">欢迎来到我的博客</h1>
      <p className="text-xl text-slate-600">
        这是一个基于 Next.js 和 Markdown 的现代化个人博客
      </p>
      <div className="mt-8">
        <Link
          href="/blog"
          className="inline-block px-6 py-3 text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
        >
          查看博客文章
        </Link>
      </div>
    </section>
  );
}