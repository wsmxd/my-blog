import Link from "next/link";
import FlowingGradient from './components/FlowingGradient'; // 或 DynamicBackground
import AnimatedSection from './components/AnimatedSection';
import { getAllPosts } from '../lib/posts';
import { getTotalReads } from '../lib/reads';

export default async function HomePage() {
  const posts = await getAllPosts();
  const postsCount = posts.length;
  const totalReads = await getTotalReads();

  return (
    <>
      {/* 动态背景 */}
      <FlowingGradient />

      {/* 内容区域：半透明 + 淡入 （动画在客户端执行） */}
      <AnimatedSection className="min-h-screen flex items-center justify-center">
        <section className="text-center space-y-8 max-w-2xl mx-auto px-6 relative z-10">
          {/* 卡片底板：半透明磨砂 */}
          {/* <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl rounded-2xl -z-10"></div> */}

          {/* 头像/logo */}
          {/* <div className="flex justify-center">
            <div className="w-24 h-24 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              mxd
            </div>
          </div> */}

          {/* 主标题 */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-linear-to-r from-slate-200 to-blue-300 bg-clip-text text-transparent">
              欢迎来到马晓东的博客
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              这是一个基于 <span className="font-semibold text-blue-300">Next.js</span> 和{" "}
              <span className="font-semibold text-green-400">Markdown</span> 的现代化个人博客
            </p>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-3">
            {["🚀 快速加载", "📱 响应式", "🎨 现代化", "📝 Markdown"].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full text-slate-300 text-sm font-medium border border-slate-600/30"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* CTA 按钮 */}
          <div className="pt-4">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-linear-to-r from-slate-700 to-blue-800 rounded-xl hover:from-slate-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>查看博客文章</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* 统计数据（服务端渲染，利于 SEO） */}
          <div className="flex justify-center gap-8 pt-4 text-slate-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-300">{postsCount}</div>
              <div className="text-sm">博客文章</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-300">{totalReads}</div>
              <div className="text-sm">阅读量</div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}