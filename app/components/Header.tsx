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
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors"
          >
            <PrefixedImage
              src="/avatar.jpg"
              alt="Profile"
              width={48}
              height={48}
              className="object-cover"
            />
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