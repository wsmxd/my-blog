'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PrefixedImage from '../components/PrefixedImage';
import { useEffect, useState } from 'react';
import type { Post } from '../../lib/posts';
import TagBadge from '../components/TagBadge';

interface BlogListClientProps {
  posts: Pick<Post, 'slug' | 'meta'>[]; 
}

const POSTS_PER_PAGE = 6;

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reads, setReads] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.meta.category === selectedCategory)
    : posts;

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const displayPage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (displayPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setReads(data.perPost || {});
      } catch (error) {
        console.error(error);
      }
    }
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const handlePageChange = (page: number) => {
    if (page === 1 && selectedCategory !== null) {
      setSelectedCategory(null);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (category: string | null) => selectedCategory === category;
  const inactiveButtonClass = 'bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border-2 border-(--card-border) backdrop-blur-md';
  const activeButtonClass = 'text-white shadow-xl scale-105 border border-transparent';
  const activeButtonStyle = {
    backgroundImage: 'linear-gradient(90deg, var(--filter-active-from), var(--filter-active-to))',
    boxShadow: '0 10px 28px -10px var(--filter-active-shadow)',
  };

  return (
    // 👇 添加 overflow-x-hidden 防止横向滚动
    <section className="space-y-6 pt-16 px-4 sm:px-6 relative overflow-x-hidden">
      {/* 👇 背景装饰 - 添加 pointer-events-none 并确保不溢出 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl pointer-events-none -z-10" />
      
      {/* 分类筛选按钮 */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          style={!selectedCategory ? activeButtonStyle : undefined}
          className={`px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap font-semibold ${
            !selectedCategory
              ? activeButtonClass
              : inactiveButtonClass
          }`}
        >
          全部
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory('professional')}
          style={isActive('professional') ? activeButtonStyle : undefined}
          className={`px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap font-semibold ${
            isActive('professional')
              ? activeButtonClass
              : inactiveButtonClass
          }`}
        >
          专业文章
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory('daily')}
          style={isActive('daily') ? activeButtonStyle : undefined}
          className={`px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap font-semibold ${
            isActive('daily')
              ? activeButtonClass
              : inactiveButtonClass
          }`}
        >
          日常随笔
        </motion.button>
      </div>

      {/* 👇 文章列表网格 - 添加 w-full max-w-full */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full max-w-full">
        {currentPosts.map((post, index) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          onClick={() => {
            try {
              fetch(`/api/read/${encodeURIComponent(post.slug)}`, {
                method: 'POST',
                body: JSON.stringify({ count: 1 }),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
              });
            } catch {}
          }}
        >
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
            whileHover={{ 
              y: -8,
              transition: { duration: 0.3, ease: 'easeOut' }
            }}
            className="group relative p-6 border border-(--card-border) rounded-2xl bg-(--surface-soft) backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* 👇 光晕效果 - 添加 pointer-events-none */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-linear-to-br from-blue-900/20 to-purple-900/20">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <PrefixedImage
                  src={post.meta.cover || '/images/default-cover.svg'}
                  alt={post.meta.title}
                  fill
                  preload
                  className="object-cover"
                />
              </motion.div>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors duration-800">
              {post.meta.title}
            </h2>
            
            <p className="text-sm text-(--muted-foreground) mb-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.meta.date || '日期未知'}
            </p>
            
            <p className="text-(--muted-foreground) text-sm leading-relaxed mb-4 line-clamp-3">
              {post.meta.description || '暂无描述'}
            </p>
            
            <div className="flex items-center justify-between text-sm pt-4 border-t border-(--card-border)">
              <div className="flex-1 mr-2">
                <TagBadge tags={post.meta.tags} maxTags={3} />
              </div>
              <div className="text-(--muted-foreground) text-sm flex items-center gap-1 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-semibold text-foreground">{reads[post.slug] ?? '—'}</span>
              </div>
            </div>
          </motion.article>
        </Link>
        ))}
      </div>
      
      {filteredPosts.length > POSTS_PER_PAGE && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(displayPage - 1)}
            disabled={displayPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              displayPage === 1
                ? 'bg-(--surface-soft) text-(--muted-foreground)/70 cursor-not-allowed border border-(--card-border)'
                : 'bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border border-(--card-border)'
            }`}
          >
            ← 上一页
          </motion.button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page)}
                style={displayPage === page ? activeButtonStyle : undefined}
                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                  displayPage === page
                    ? 'text-white border border-transparent'
                    : 'bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border border-(--card-border)'
                }`}
              >
                {page}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePageChange(displayPage + 1)}
            disabled={displayPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              displayPage === totalPages
                ? 'bg-(--surface-soft) text-(--muted-foreground)/70 cursor-not-allowed border border-(--card-border)'
                : 'bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border border-(--card-border)'
            }`}
          >
            下一页 →
          </motion.button>
        </div>
      )}
    </section>
  );
}