'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

type NavItem = {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

const primaryNavItems: NavItem[] = [
  { href: '/blog', label: '博客' },
  { href: '/videos', label: '视频' },
  { href: '/scripts', label: '脚本' },
  { href: '/images', label: '图床' },
  { href: '/upload', label: '上传' },
  {
    href: 'https://github.com/wsmxd/my-blog',
    label: 'GitHub',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
];

export default function Header() {
  const [latestUpdate, setLatestUpdate] = useState<LatestUpdate | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  if (pathname?.startsWith('/images')) {
    return null;
  }

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
      <div className="container mx-auto flex flex-col gap-3 px-4 py-2 relative lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          {/* 头像链接 */}
          <Link href="/about" className="group flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.09, y: -2.5 }}
              transition={{ type: 'spring', stiffness: 280, damping: 16 }}
              className="relative isolate h-10 w-10 rounded-full border border-(--header-border) shadow-sm transition-[border-color,box-shadow,transform] duration-500 ease-out transform-gpu sm:h-12 sm:w-12 group-hover:shadow-[0_12px_32px_-10px_rgba(56,189,248,0.72)] dark:group-hover:shadow-[0_14px_36px_-10px_rgba(99,102,241,0.78)]"
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

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--header-border) bg-(--surface-soft) text-foreground shadow-sm transition-all duration-300 hover:scale-105"
            >
              <span className="relative block h-4 w-4">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-all duration-300 ${mobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''}`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-0.5 w-4 rounded-full bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}
                />
                <span
                  className={`absolute left-0 top-3 h-0.5 w-4 rounded-full bg-current transition-all duration-300 ${mobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''}`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex absolute left-[28%] top-1/2 -translate-y-1/2 px-6">
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
        <nav className="hidden items-center gap-2 text-sm lg:flex lg:gap-2.5">
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target}
              rel={item.rel}
              className={`group inline-flex items-center rounded-full border px-4 py-2 text-base transition-all duration-300 hover:-translate-y-0.5 hover:border-(--header-border) hover:bg-(--surface-soft) hover:text-foreground hover:shadow-sm sm:text-lg ${pathname === item.href ? 'border-(--header-border) bg-(--surface-strong) text-foreground shadow-sm' : 'border-transparent text-(--muted-foreground)'}`}
                aria-current={pathname === item.href ? 'page' : undefined}
                data-active={pathname === item.href}
            >
              <span className="relative">
                {item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-sky-500 transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {mobileMenuOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden rounded-3xl border border-(--header-border) bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.7)_100%)] p-2 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.78)_100%)]"
          >
            <nav className="grid gap-2 text-sm">
              <div className="rounded-2xl border border-(--header-border) bg-(--surface-soft)/85 p-2 shadow-sm">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-(--muted-foreground)">
                  站点导航
                </p>
                <div className="grid gap-1.5">
                  {primaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.target}
                      rel={item.rel}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center justify-between rounded-2xl border bg-transparent px-4 py-3.5 text-base transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-500/20 hover:bg-(--surface-strong) hover:shadow-[0_10px_24px_-16px_rgba(14,165,233,0.8)] ${pathname === item.href ? 'border-sky-500/20 bg-(--surface-strong) text-foreground shadow-[0_10px_24px_-16px_rgba(14,165,233,0.8)]' : 'border-transparent text-foreground'}`}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/12 text-sm font-semibold text-sky-500 transition-transform duration-300 group-hover:scale-105">
                          {item.label.slice(0, 1)}
                        </span>
                        <span className="font-medium tracking-wide">{item.label}</span>
                      </span>
                      <span className="text-xs text-(--muted-foreground) transition-transform duration-300 group-hover:translate-x-0.5">
                        {item.href.startsWith('http') ? '外部' : '进入'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-(--header-border) bg-(--surface-soft)/70 px-4 py-3 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--muted-foreground)">主题</p>
                  <p className="text-sm text-foreground/90">切换浅色 / 深色</p>
                </div>
                <ThemeToggle />
              </div>
            </nav>
          </motion.div>
        ) : null}
      </div>
    </motion.header>
  );
}