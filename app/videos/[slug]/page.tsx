import { notFound } from 'next/navigation';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { getAllVideos, getVideoBySlug } from '../../../lib/videos';
import VideoPlayer from './VideoPlayer';
import ClientEntry from './ClientEntry';

export const dynamic = 'force-static';
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateStaticParams() {
  const videos = await getAllVideos();
  return videos.map((video) => ({ slug: video.slug }));
}

const VideoContent = async ({ video }: { video: Awaited<ReturnType<typeof getVideoBySlug>> }) => {
  return (
    <article className="pt-12 max-w-5xl mx-auto relative overflow-x-hidden w-full">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -left-20 w-96 h-96 bg-blue-400/5 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <header className="mb-8 pb-6 border-slate-200 dark:border-slate-700/50 border-b relative">
        <h1
          className="text-3xl sm:text-5xl font-bold mb-3 bg-clip-text text-transparent leading-tight"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--article-title-from), var(--article-title-via), var(--article-title-to))',
          }}
        >
          {video.meta.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
          {video.meta.date || '日期未知'} · 时长 {video.meta.duration || '未知'}
        </p>
      </header>

      <VideoPlayer url={video.meta.videoUrl} />

      <div className="prose-container mt-8 bg-white dark:bg-slate-900/50 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl backdrop-blur-lg border-slate-100 dark:border-slate-700/30 border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 dark:bg-linear-to-br dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <MarkdownRenderer content={video.content} />
        </div>
      </div>
    </article>
  );
};

export default async function VideoDetailPage({ params }: Props) {
  const resolvedParams = await params;

  if (!resolvedParams?.slug) {
    notFound();
  }

  let video;
  try {
    video = await getVideoBySlug(resolvedParams.slug);
  } catch {
    notFound();
  }

  if (!video) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <VideoContent video={video} />
      <ClientEntry slug={resolvedParams.slug} />
    </ErrorBoundary>
  );
}
