import { getAllPosts } from '../../lib/posts';
import BlogListClient from './BlogListClient';

const POSTS_PER_PAGE = 6;

// 需要根据 folder query 动态筛选文章
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '博客',
  description: '分享技术、思考与生活点滴。',
};

type PageProps = {
  searchParams?: { folder?: string | string[] } | Promise<{ folder?: string | string[] }>;
};

export default async function BlogIndex({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const folderParam = resolvedSearchParams?.folder;
  const activeFolder = Array.isArray(folderParam) ? folderParam[0] : folderParam || undefined;
  const allPosts = await getAllPosts();
  const folders = Array.from(new Set(allPosts.map((post) => post.meta.folder).filter(Boolean))) as string[];
  const filteredPosts = activeFolder
    ? allPosts.filter((post) => post.meta.folder === activeFolder)
    : allPosts;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const posts = filteredPosts.slice(0, POSTS_PER_PAGE);

  return (
    <BlogListClient
      posts={posts}
      currentPage={1}
      totalPages={totalPages}
      folders={folders}
      activeFolder={activeFolder}
    />
  );
}