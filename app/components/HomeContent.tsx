'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface HomeContentProps {
  postsCount: number;
  totalReads: number;
}

export default function HomeContent({ postsCount, totalReads }: HomeContentProps) {
  return (
    <section className="text-center space-y-8 max-w-2xl mx-auto px-6 relative z-10">
      {/* 主标题 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="space-y-4"
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-linear-to-r from-sky-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg animate-float">
          欢迎来到 mxd的小窝
        </h1>
        <p className="text-lg sm:text-xl text-(--muted-foreground) leading-relaxed font-medium">
          这里记录了基于 <span className="font-bold text-blue-500">Next.js</span> 和{' '}
          <span className="font-bold text-emerald-500">Markdown</span> 的技术分享与生活随笔
        </p>
      </motion.div>

      {/* 特性标签 */}
      <div className="flex flex-wrap justify-center gap-3">
        {["🚀 快速加载", "📱 响应式", "🎨 现代化", "📝 Markdown"].map((feature, index) => (
          <motion.span
            key={feature}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ 
              scale: 1.15, 
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-full text-foreground text-sm font-semibold border-2 border-(--card-border) bg-(--surface-soft) hover:border-blue-400/60 hover:shadow-lg cursor-pointer transition-all duration-300"
          >
            {feature}
          </motion.span>
        ))}
      </div>

      {/* CTA 按钮 */}
      <div className="pt-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link
            href="/blog"
            className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/40 relative overflow-hidden"
          >
            {/* 按钮光晕效果 */}
            <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <span className="relative">查看博客文章</span>
            <motion.span
              className="relative text-xl"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* 统计数据 */}
      <div className="flex justify-center gap-6 pt-8 flex-wrap">
        <motion.div 
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="text-center p-6 rounded-2xl backdrop-blur-lg border-2 border-(--card-border) bg-(--surface-strong) hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer transition-all duration-300 min-w-[140px]"
        >
          <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{postsCount}</div>
          <div className="text-sm mt-2 font-semibold text-(--muted-foreground)">博客文章</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="text-center p-6 rounded-2xl backdrop-blur-lg border-2 border-(--card-border) bg-(--surface-strong) hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer transition-all duration-300 min-w-[140px]"
        >
          <div className="text-4xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{totalReads}</div>
          <div className="text-sm mt-2 font-semibold text-(--muted-foreground)">阅读量</div>
        </motion.div>
      </div>
    </section>
  );
}
