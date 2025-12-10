import { getAllPosts } from '../../lib/posts';
import BlogListClient from './BlogListClient';

// 强制静态生成
export const dynamic = 'force-static';
export const revalidate = 3600; // 1小时重新验证一次

export const metadata = {
  title: '博客 | My Modern Blog',
  description: '分享技术、思考与生活点滴。',
};

export default async function BlogIndex() {
  // 获取所有文章，在客户端进行筛选
  const posts = await getAllPosts();

  return (
    <BlogListClient posts={posts} />
  );
}