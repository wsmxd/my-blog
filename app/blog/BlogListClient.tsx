'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Post } from '../../lib/posts';

interface BlogListClientProps {
  posts: Pick<Post, 'slug' | 'meta'>[]; // 只需要 slug 和 meta，更精确（可选）
  // 或直接用：posts: Post[];
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [reads, setReads] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setReads(data.perPost || {});
      } catch (err) {
        // ignore
        console.error(err);
      }
    }
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post, index) => (
        <motion.article
          key={post.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
          className="group relative p-6 border border-slate-700/50 rounded-xl bg-slate-900/70 backdrop-blur-sm hover:bg-slate-900/80 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={post.meta.cover || '/images/default-cover.svg'}
              alt={post.meta.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">
            <Link href={`/blog/${post.slug}`} className="hover:text-blue-400 transition-colors">
              {post.meta.title}
            </Link>
          </h2>
          <p className="text-sm text-slate-400 mb-3">
            {post.meta.date || '日期未知'}
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {post.meta.description || '暂无描述'}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-400 hover:text-blue-300 transition-colors">
              <Link
                href={`/blog/${post.slug}`}
                onClick={(_) => {
                  // fire-and-forget increment; use keepalive so navigation won't cancel it
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
                阅读更多 →
              </Link>
            </div>
            <div className="text-slate-400 text-sm">
              阅读量： <span className="font-semibold text-slate-200">{reads[post.slug] ?? '—'}</span>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}