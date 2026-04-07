import { notFound, redirect } from 'next/navigation';
import { getAllPosts } from '../../../../lib/posts';
import BlogListClient from '../../BlogListClient';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 6;

type Props = {
  params: Promise<{ page: string }> | { page: string };
  searchParams?: { folder?: string | string[] } | Promise<{ folder?: string | string[] }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  if (totalPages <= 1) {
    return [];
  }

  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export default async function BlogPagedIndex({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const pageNumber = Number(resolvedParams.page);
  const folderParam = resolvedSearchParams?.folder;
  const activeFolder = Array.isArray(folderParam) ? folderParam[0] : folderParam || undefined;

  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    notFound();
  }

  if (pageNumber === 1) {
    redirect('/blog');
  }

  const allPosts = await getAllPosts();
  const folders = Array.from(new Set(allPosts.map((post) => post.meta.folder).filter(Boolean))) as string[];
  const filteredPosts = activeFolder
    ? allPosts.filter((post) => post.meta.folder === activeFolder)
    : allPosts;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  if (pageNumber > totalPages) {
    notFound();
  }

  const start = (pageNumber - 1) * POSTS_PER_PAGE;
  const posts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

  return (
    <BlogListClient
      posts={posts}
      currentPage={pageNumber}
      totalPages={totalPages}
      folders={folders}
      activeFolder={activeFolder}
    />
  );
}
