import { getAllPosts } from '../../lib/posts';
import BlogListClient from './BlogListClient';;

export async function generateMetadata() {
  return {
    title: '博客 | My Modern Blog',
    description: '分享技术、思考与生活点滴。',
  };
}

export default async function BlogIndex() {
  // ✅ 在服务端获取数据（SSG/SSR）
  const posts = await getAllPosts();

  return (
    <section className="space-y-6 pt-16">
      {/* 标题也保留在服务端渲染 */}
      <h1 className="text-3xl font-bold text-slate-200">博客</h1>

      {/* 将数据传给客户端组件做动画 */}
      <BlogListClient posts={posts} />
    </section>
  );
}