import { getAllPosts } from '../../lib/posts';
import BlogListClient from './BlogListClient';
import Link from 'next/link';
import { Suspense } from 'react';

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = params?.category;

  let title = '博客 | My Modern Blog';
  let description = '分享技术、思考与生活点滴。';

  if (category === 'professional') {
    title = '专业文章 | My Modern Blog';
    description = '深入探讨编程、系统设计与工程实践。';
  } else if (category === 'daily') {
    title = '日常随笔 | My Modern Blog';
    description = '记录生活、感悟与日常点滴。';
  }

  return { title, description };
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const selectedCategory = params?.category;

  const posts = await getAllPosts(selectedCategory);

  // 用于判断链接是否激活
  const isActive = (category: string | null) => selectedCategory === category;

  return (
    <section className="space-y-6 pt-16 px-4 sm:px-6 relative">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl" />
      
      <div className="mb-8 flex flex-wrap justify-center gap-3 relative z-10">
        <Link
          href="/blog"
          className={`px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap font-semibold ${
            !selectedCategory
              ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800/90 border-2 border-slate-600/30 backdrop-blur-md'
          }`}
          prefetch={false}
        >
          全部
        </Link>
        <Link
          href="/blog?category=professional"
          className={`px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap font-semibold ${
            isActive('professional')
              ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800/90 border-2 border-slate-600/30 backdrop-blur-md'
          }`}
          prefetch={false}
        >
          专业文章
        </Link>
        <Link
          href="/blog?category=daily"
          className={`px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap font-semibold ${
            isActive('daily')
              ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105'
              : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800/90 border-2 border-slate-600/30 backdrop-blur-md'
          }`}
          prefetch={false}
        >
          日常随笔
        </Link>
      </div>

      {/* 可选：加载骨架屏（如果需要） */}
      <Suspense fallback={<div className="text-center text-slate-400">加载中...</div>}>
        <BlogListClient posts={posts} />
      </Suspense>
    </section>
  );
}