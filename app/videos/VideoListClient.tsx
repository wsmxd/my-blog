'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import TagBadge from '../components/TagBadge';
import PrefixedImage from '../components/PrefixedImage';
import type { Video } from '../../lib/videos';

interface VideoListClientProps {
  videos: Pick<Video, 'slug' | 'meta'>[];
}

const VIDEOS_PER_PAGE = 6;

function formatDateYMD(raw?: string): string {
  if (!raw) return '日期未知';

  const s = String(raw).trim();
  const direct = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (direct) return direct[1];

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return s;
}

export default function VideoListClient({ videos }: VideoListClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const [plays, setPlays] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const displayPage = currentPage > totalPages ? 1 : currentPage;

  const currentVideos = useMemo(() => {
    const start = (displayPage - 1) * VIDEOS_PER_PAGE;
    return videos.slice(start, start + VIDEOS_PER_PAGE);
  }, [displayPage, videos]);

  useEffect(() => {
    let mounted = true;
    async function fetchVideoStats() {
      try {
        const res = await fetch('/api/video-stats');
        if (!res.ok) return;
        const data = (await res.json()) as { perVideo?: Record<string, number> };
        if (!mounted) return;
        setPlays(data.perVideo || {});
      } catch {
        // ignore for public pages
      }
    }

    fetchVideoStats();
    const id = setInterval(fetchVideoStats, 30_000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.07,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 18,
      scale: prefersReducedMotion ? 1 : 0.985,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : {
            type: 'spring' as const,
            stiffness: 145,
            damping: 19,
            mass: 0.82,
          },
    },
  };

  return (
    <section className="space-y-6 pt-16 px-4 sm:px-6 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto w-full max-w-6xl px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">视频列表</h1>
        <p className="text-(--muted-foreground) mb-8">聚合项目演示、技术分享与生活记录视频。</p>

        <motion.div
          key={`videos-${displayPage}`}
          initial="hidden"
          animate="show"
          variants={gridVariants}
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full"
        >
          {currentVideos.map((video) => (
            <Link key={video.slug} href={`/videos/${video.slug}`}>
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
                className="group relative p-6 border border-(--card-border) rounded-2xl bg-(--surface-soft) backdrop-blur-md shadow-lg hover:shadow-2xl transition-[transform,box-shadow,border-color,background-color] duration-260 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden cursor-pointer h-full flex flex-col will-change-transform"
              >
                <div className="absolute inset-0 bg-linear-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-260 ease-out pointer-events-none" />
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:translate-x-full group-hover:opacity-100 transition-[transform,opacity] duration-340 ease-[cubic-bezier(0.22,1,0.36,1)]" />

                <div className="relative w-full aspect-video mb-4 rounded-xl overflow-hidden bg-linear-to-br from-blue-900/20 to-purple-900/20">
                  <PrefixedImage
                    src={video.meta.cover || '/images/default-cover.svg'}
                    alt={video.meta.title}
                    fill
                    className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-106"
                  />
                  <span className="absolute right-2 bottom-2 text-xs px-2 py-1 rounded-md bg-black/60 text-white">
                    {video.meta.duration || '未知时长'}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors duration-260">
                  {video.meta.title}
                </h2>

                <p className="text-sm text-(--muted-foreground) mb-3">{formatDateYMD(video.meta.date)}</p>

                <p className="text-(--muted-foreground) text-sm leading-relaxed mb-4 line-clamp-3">
                  {video.meta.description || '暂无描述'}
                </p>

                <div className="flex items-center justify-between text-sm pt-4 border-t border-(--card-border) mt-auto gap-2">
                  <div className="flex-1">
                    <TagBadge tags={video.meta.tags} maxTags={2} />
                  </div>
                  <span className="shrink-0 text-(--muted-foreground)">
                    播放 {plays[video.slug] ?? 0}
                  </span>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>
      </div>

      {videos.length > VIDEOS_PER_PAGE && (
        <div className="mx-auto w-full max-w-6xl px-4 flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={displayPage === 1}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-(--surface-soft) text-(--muted-foreground) border border-(--card-border) disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← 上一页
          </button>

          <div className="text-sm text-(--muted-foreground)">
            第 {displayPage} / {totalPages} 页
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={displayPage === totalPages}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-(--surface-soft) text-(--muted-foreground) border border-(--card-border) disabled:cursor-not-allowed disabled:opacity-60"
          >
            下一页 →
          </button>
        </div>
      )}
    </section>
  );
}
