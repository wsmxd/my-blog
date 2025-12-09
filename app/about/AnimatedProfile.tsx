'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { ProfileData, SocialLink } from './page';
import { GitHubIcon, TwitterIcon, LinkedInIcon, MailIcon, BilibiliIcon, DouyinIcon } from './SocialIcons';

const IconMap = {
  github: GitHubIcon,
  bilibili: BilibiliIcon,
  douyin: DouyinIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
  email: MailIcon,
};

interface AnimatedProfileProps {
  profile: ProfileData;
  socialLinks: SocialLink[];
}

export default function AnimatedProfile({ profile, socialLinks }: AnimatedProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // 更平滑的弹跳效果
      className="relative z-10 text-center max-w-2xl mx-auto px-6 py-12"
    >
      {/* 🔸 新增：卡片背景板 (玻璃拟态) */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl -z-10"></div>

      {/* 头像 - 增加发光效果 */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full mb-8 group"
      >
        {/* 头像光晕 */}
        <div className="absolute inset-0 rounded-full bg-blue-500/50 blur-xl group-hover:bg-purple-500/60 transition-colors duration-500"></div>
        <div className="relative rounded-full overflow-hidden border-2 border-white/20 h-full w-full">
            <Image
            src="/avatar.jpg"
            alt={profile.name}
            fill // 使用 fill 让图片自适应容器
            className="object-cover"
            priority
            />
        </div>
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white via-blue-100 to-slate-300 mb-2 drop-shadow-sm">
        {profile.name}
      </h1>
      <p className="text-lg text-blue-200/80 mb-6 font-medium tracking-wide">{profile.title}</p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto"
      >
        {profile.bio}
      </motion.p>

      {/* 社交链接 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-4 flex-wrap"
      >
        {socialLinks.map((link) => {
          const Icon = IconMap[link.icon];
          return (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3.5 rounded-xl bg-white/5 hover:bg-white/10
                        border border-white/10 shadow-none"
              aria-label={link.name}
              whileHover={{
                y: -4,                           // 向上 4 px
                boxShadow: '0 0 20px -5px rgba(66,153,225,0.4)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }} // 弹性过渡
            >
              <Icon className="w-5 h-5 text-slate-300 group-hover:text-blue-200 transition-colors duration-500" />
            </motion.a>
          );
        })}
      </motion.div>

      {/* 返回按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-500 rounded-full transition-all duration-300 hover:bg-white/5"
        >
          <span>←</span> <span className="tracking-wide">Back to Blog</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}