'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PrefixedImage from '../components/PrefixedImage';
import { useEffect, useState } from 'react';
import type { Post } from '../../lib/posts';
import TagBadge from '../components/TagBadge';

const STATS_CACHE_TTL_MS = 30_000;
let statsCache: { perPost: Record<string, number>; updatedAt: number } | null = null;

interface BlogListClientProps {
  posts: Pick<Post, 'slug' | 'meta'>[];
  currentPage: number;
  totalPages: number;
  folders?: string[];
  activeFolder?: string;
}

export default function BlogListClient({ posts, currentPage, totalPages, folders = [], activeFolder }: BlogListClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const [reads, setReads] = useState<Record<string, number>>(() => {
    if (statsCache && Date.now() - statsCache.updatedAt < STATS_CACHE_TTL_MS) {
      return statsCache.perPost;
    }
    return {};
  });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = (await res.json()) as { perPost?: Record<string, number> };
        if (!mounted) return;
        const perPost = data.perPost || {};
        statsCache = { perPost, updatedAt: Date.now() };
        setReads(perPost);
      } catch (error) {
        console.error(error);
      }
    }

    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const hrefs = ['/blog', ...folders.map((folder) => `/blog?folder=${encodeURIComponent(folder)}`)];

    hrefs.forEach((href) => {
      router.prefetch(href);
    });
  }, [folders, router]);

  const getPageHref = (page: number) => {
    const folderQuery = activeFolder ? `?folder=${encodeURIComponent(activeFolder)}` : '';
    return page <= 1 ? `/blog${folderQuery}` : `/blog/page/${page}${folderQuery}`;
  };
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const folderButtons = ['all', ...folders];

  const activeButtonStyle = {
    backgroundImage: 'linear-gradient(90deg, var(--filter-active-from), var(--filter-active-to))',
    boxShadow: '0 10px 28px -10px var(--filter-active-shadow)',
  };

  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.02,
        delayChildren: prefersReducedMotion ? 0 : 0.01,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 8,
      scale: prefersReducedMotion ? 1 : 0.995,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : {
            type: 'spring' as const,
            stiffness: 220,
            damping: 24,
            mass: 0.7,
          },
    },
  };

  const coverImageSizes = '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 33vw';

  return (
    <section className="space-y-6 pt-16 px-4 sm:px-6 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap gap-3">
          {folderButtons.map((folder) => {
            const isAll = folder === 'all';
            const isActive = isAll ? !activeFolder : activeFolder === folder;
            const href = isAll ? '/blog' : `/blog?folder=${encodeURIComponent(folder)}`;

            return (
              <Link
                key={folder}
                href={href}
                prefetch
                onMouseEnter={() => {
                  router.prefetch(href);
                }}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border ${
                  isActive
                    ? 'border-transparent text-white shadow-lg'
                    : 'border-(--card-border) bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong)'
                }`}
                style={isActive ? activeButtonStyle : undefined}
              >
                {isAll ? '全部' : folder}
              </Link>
            );
          })}
        </div>

        <motion.div
          key={`blog-${currentPage}-${activeFolder ?? 'all'}`}
          initial="hidden"
          animate="show"
          variants={gridVariants}
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full"
        >
        {posts.map((post, index) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="block h-full"
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
            variants={cardVariants}
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    y: -6,
                    scale: 1.01,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      mass: 0.9,
                    },
                    boxShadow: '0 20px 46px -26px rgba(56, 189, 248, 0.55)',
                  }
            }
              className="group relative p-6 border border-(--card-border) rounded-2xl bg-(--surface-soft) backdrop-blur-md shadow-lg hover:shadow-2xl transition-[transform,box-shadow,border-color,background-color] duration-260 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden cursor-pointer h-full min-h-[420px] flex flex-col will-change-transform"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-260 ease-out pointer-events-none" />
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:translate-x-full group-hover:opacity-100 transition-[transform,opacity] duration-340 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            
            <div className="relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-linear-to-br from-blue-900/20 to-purple-900/20">
              <div className="relative w-full h-full overflow-hidden">
                <PrefixedImage
                  src={post.meta.cover || '/images/default-cover.svg'}
                  alt={post.meta.title}
                  fill
                  preload={index < 3}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  sizes={coverImageSizes}
                  className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-106"
                />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2 min-h-[2.75rem] line-clamp-2 group-hover:text-blue-500 transition-colors duration-260">
              {post.meta.title}
            </h2>
            
            <p className="text-sm text-(--muted-foreground) mb-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.meta.date || '日期未知'}
            </p>
            
            <p className="text-(--muted-foreground) text-sm leading-relaxed mb-4 min-h-[2.75rem] line-clamp-2">
              {post.meta.description || '暂无描述'}
            </p>
            
            <div className="flex items-center justify-between text-sm pt-4 border-t border-(--card-border) mt-auto">
              <div className="flex-1 mr-2">
                <TagBadge tags={post.meta.tags} maxTags={2} />
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
        </motion.div>
      </div>

    {totalPages > 1 && (
      <div className="mx-auto w-full max-w-6xl px-4 mt-10 overflow-hidden">
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-2">
          
          {/* 上一页按钮 */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 hover:scale-105 transition-transform duration-200"
          >
            {currentPage === 1 ? (
              <span className="flex items-center gap-1 px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 bg-(--surface-soft) text-(--muted-foreground)/70 cursor-not-allowed border border-(--card-border)">
                <span aria-hidden="true">←</span>
                <span className="hidden sm:inline">上一页</span>
              </span>
            ) : (
              <Link
                href={getPageHref(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border border-(--card-border)"
              >
                <span aria-hidden="true">←</span>
                <span className="hidden sm:inline">上一页</span>
              </Link>
            )}
          </motion.div>

          {/* 页码数字区域 */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            {pageNumbers.map((page) => (
              // 核心修改：移除 whileHover，改用 CSS hover:scale-110
              <div
                key={page}
                className="hover:scale-110 transition-transform duration-200 flex-shrink-0"
              >
                <Link
                  href={getPageHref(page)}
                  style={currentPage === page ? activeButtonStyle : undefined}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`min-w-[2.5rem] h-10 px-2 rounded-lg text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center ${
                    currentPage === page
                      ? 'text-white border border-transparent'
                      : 'bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border border-(--card-border)'
                  }`}
                >
                  {page}
                </Link>
              </div>
            ))}
          </div>

          {/* 下一页按钮 */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 hover:scale-105 transition-transform duration-200"
          >
            {currentPage === totalPages ? (
              <span className="flex items-center gap-1 px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 bg-(--surface-soft) text-(--muted-foreground)/70 cursor-not-allowed border border-(--card-border)">
                <span className="hidden sm:inline">下一页</span>
                <span aria-hidden="true">→</span>
              </span>
            ) : (
              <Link
                href={getPageHref(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 bg-(--surface-soft) text-(--muted-foreground) hover:bg-(--surface-strong) border border-(--card-border)"
              >
                <span className="hidden sm:inline">下一页</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    )}
    </section>
  );
}