import { notFound, redirect } from 'next/navigation';
import { getAllVideos } from '../../../../lib/videos';
import VideoListClient from '../../VideoListClient';

export const dynamic = 'force-static';
export const revalidate = 3600;

const VIDEOS_PER_PAGE = 6;

type Props = {
  params: Promise<{ page: string }> | { page: string };
};

export async function generateStaticParams() {
  const videos = await getAllVideos();
  const totalPages = Math.max(1, Math.ceil(videos.length / VIDEOS_PER_PAGE));

  if (totalPages <= 1) {
    return [];
  }

  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export default async function VideosPagedIndex({ params }: Props) {
  const resolvedParams = await params;
  const pageNumber = Number(resolvedParams.page);

  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    notFound();
  }

  if (pageNumber === 1) {
    redirect('/videos');
  }

  const allVideos = await getAllVideos();
  const totalPages = Math.max(1, Math.ceil(allVideos.length / VIDEOS_PER_PAGE));

  if (pageNumber > totalPages) {
    notFound();
  }

  const start = (pageNumber - 1) * VIDEOS_PER_PAGE;
  const videos = allVideos.slice(start, start + VIDEOS_PER_PAGE);

  return <VideoListClient videos={videos} currentPage={pageNumber} totalPages={totalPages} />;
}
