'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-slate-200 hover:text-white transition-colors">
          My Modern Blog
        </Link>

        {/* 导航 */}
        <nav className="flex space-x-6 text-sm">
          <Link
            href="/blog"
            className="text-slate-400 hover:text-slate-200 transition-colors relative group"
          >
            博客
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <a
            href="https://github.com/wsmxd/my-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors relative group"
          >
            GitHub
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </a>
        </nav>
      </div>
    </motion.header>
  );
}