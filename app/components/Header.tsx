'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PrefixedImage from './PrefixedImage';
import ThemeToggle from './ThemeToggle';
import { useEffect, useState } from 'react';

type LatestUpdate = {
  type: 'post' | 'video' | 'script';
  title: string;
  href: string;
  date?: string;
};

export default function Header() {
  const [latestUpdate, setLatestUpdate] = useState<LatestUpdate | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLatestUpdate() {
      try {
        const res = await fetch('/api/latest-update', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { latestUpdate?: LatestUpdate | null };
        if (!mounted) return;
        setLatestUpdate(data.latestUpdate || null);
      } catch {
        // keep silent for non-blocking decorative widget
      }
    }

    loadLatestUpdate();

    return () => {
      mounted = false;
    };
  }, []);

  const updateTypeText: Record<'post' | 'video' | 'script', string> = {
    post: '博客',
    video: '视频',
    script: '脚本',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-(--header-border) bg-(--header-bg) backdrop-blur-md transition-colors duration-300"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between relative">
        {/* 头像链接 */}
        <Link href="/about" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.09, y: -2.5 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className="relative isolate h-12 w-12 rounded-full border border-(--header-border) shadow-sm transition-[border-color,box-shadow,transform] duration-500 ease-out transform-gpu group-hover:shadow-[0_12px_32px_-10px_rgba(56,189,248,0.72)] dark:group-hover:shadow-[0_14px_36px_-10px_rgba(99,102,241,0.78)]"
          >
            <span className="pointer-events-none absolute -inset-2 -z-20 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.38)_0%,rgba(56,189,248,0.18)_34%,rgba(56,189,248,0.08)_54%,transparent_75%)] opacity-0 blur-sm scale-95 transition-[opacity,transform,filter] duration-500 ease-out group-hover:opacity-100 group-hover:scale-125 group-hover:blur-md dark:opacity-0" />
            <span className="pointer-events-none absolute -inset-5 -z-30 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28)_0%,rgba(14,165,233,0.14)_38%,rgba(14,165,233,0.06)_58%,transparent_78%)] opacity-0 blur-md scale-90 transition-[opacity,transform,filter] duration-700 ease-out group-hover:opacity-100 group-hover:scale-140 group-hover:blur-xl dark:opacity-0" />
            <span className="pointer-events-none absolute -inset-2 -z-20 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.58)_0%,rgba(99,102,241,0.34)_38%,rgba(59,130,246,0.12)_58%,transparent_78%)] opacity-0 blur-sm scale-95 transition-[opacity,transform,filter] duration-500 ease-out group-hover:opacity-0 dark:group-hover:opacity-100 dark:group-hover:scale-125 dark:group-hover:blur-md" />
            <span className="pointer-events-none absolute -inset-5 -z-30 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.42)_0%,rgba(59,130,246,0.24)_40%,rgba(59,130,246,0.1)_60%,transparent_80%)] opacity-0 blur-md scale-90 transition-[opacity,transform,filter] duration-700 ease-out group-hover:opacity-0 dark:group-hover:opacity-100 dark:group-hover:scale-145 dark:group-hover:blur-xl" />

            <div className="absolute inset-0 overflow-hidden rounded-full">
              <PrefixedImage
                src="/avatar.jpg"
                alt="Profile"
                width={48}
                height={48}
                className="h-full w-full scale-100 object-cover transform-gpu transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-103 group-hover:saturate-110 dark:group-hover:saturate-125"
              />
            </div>
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-sm text-(--muted-foreground)">个人博客</p>
            <p className="text-base font-semibold tracking-wide text-foreground">mxd的小窝</p>
          </div>
        </Link>

        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6">
          {latestUpdate ? (
            <motion.div
              key="latest-update-pill"
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <Link
                href={latestUpdate.href}
                className="group flex max-w-[34vw] items-center gap-2 rounded-full bg-(--surface-soft)/95 px-3 py-1.5 text-xs text-foreground shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-(--surface-strong)"
              >
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 font-semibold text-sky-500">
                  最近更新
                </span>
                <span className="text-(--muted-foreground)">{updateTypeText[latestUpdate.type]}</span>
                <span className="max-w-[16vw] truncate font-semibold group-hover:text-sky-500 transition-colors">
                  {latestUpdate.title}
                </span>
              </Link>
            </motion.div>
          ) : null}
        </div>


        {/* 导航 */}
        <nav className="flex items-center space-x-3 sm:space-x-5 text-sm">
          <Link
            href="/blog"
            className="text-(--muted-foreground) hover:text-blue-500 transition-colors relative group text-base sm:text-lg"
          >
            博客
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="/videos"
            className="text-(--muted-foreground) hover:text-blue-500 transition-colors relative group text-base sm:text-lg"
          >
            视频
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="/scripts"
            className="text-(--muted-foreground) hover:text-blue-500 transition-colors relative group text-base sm:text-lg"
          >
            脚本
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="https://github.com/wsmxd/my-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--muted-foreground) hover:text-blue-500 transition-colors relative group text-base sm:text-lg"
          >
            GitHub
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}