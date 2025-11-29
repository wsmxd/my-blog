'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* 头像链接 */}
        <Link href="/about" className="block">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
          >
            {/* 替换为你自己的头像路径，例如放在 public/avatar.jpg */}
            <Image
              src="/avatar.jpg"
              alt="Profile"
              width={48}   // 必须：与容器尺寸一致
              height={48}  // 必须
              className="object-cover"
            />
          </motion.div>
        </Link>


        {/* 导航 */}
        <nav className="flex space-x-6 text-sm">
          <Link
            href="/blog"
            className="text-slate-400 hover:text-slate-200 transition-colors relative group text-lg"
          >
            博客
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="https://github.com/wsmxd/my-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors relative group text-lg"
          >
            GitHub
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}