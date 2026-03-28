import { notFound, redirect } from 'next/navigation';
import { getAllPosts } from '../../../../lib/posts';
import BlogListClient from '../../BlogListClient';

export const dynamic = 'force-static';
export const revalidate = 3600;

const POSTS_PER_PAGE = 6;

type Props = {
  params: Promise<{ page: string }> | { page: string };
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

export default async function BlogPagedIndex({ params }: Props) {
  const resolvedParams = await params;
  const pageNumber = Number(resolvedParams.page);

  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    notFound();
  }

  if (pageNumber === 1) {
    redirect('/blog');
  }

  const allPosts = await getAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));

  if (pageNumber > totalPages) {
    notFound();
  }

  const start = (pageNumber - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(start, start + POSTS_PER_PAGE);

  return <BlogListClient posts={posts} currentPage={pageNumber} totalPages={totalPages} />;
}
