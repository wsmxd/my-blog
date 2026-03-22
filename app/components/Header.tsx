'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PrefixedImage from './PrefixedImage';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-(--header-border) bg-(--header-bg) backdrop-blur-md transition-colors duration-300"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
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