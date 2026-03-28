import { getAllPosts } from '../../lib/posts';
import BlogListClient from './BlogListClient';

const POSTS_PER_PAGE = 6;

// 强制静态生成
export const dynamic = 'force-static';
export const revalidate = 3600; // 1小时重新验证一次

export const metadata = {
  title: '博客',
  description: '分享技术、思考与生活点滴。',
};

export default async function BlogIndex() {
  const allPosts = await getAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const posts = allPosts.slice(0, POSTS_PER_PAGE);

  return (
    <BlogListClient posts={posts} currentPage={1} totalPages={totalPages} />
  );
}