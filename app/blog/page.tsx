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
    <section className="space-y-6 pt-16 px-4 sm:px-6">
      <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-4">
        <Link
          href="/blog"
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          prefetch={false}
        >
          全部
        </Link>
        <Link
          href="/blog?category=professional"
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            isActive('professional')
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          prefetch={false}
        >
          专业文章
        </Link>
        <Link
          href="/blog?category=daily"
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            isActive('daily')
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          prefetch={false}
        >
          日常随笔
        </Link>
      </div>

      {/* 可选：加载骨架屏（如果需要） */}
      <Suspense fallback={<div>加载中...</div>}>
        <BlogListClient posts={posts} />
      </Suspense>
    </section>
  );
}