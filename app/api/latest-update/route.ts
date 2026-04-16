import { NextResponse } from 'next/server';
import { getAllPosts } from '../../../lib/posts';
import { getAllVideos } from '../../../lib/videos';
import { getAllScripts, parseDateTimestamp } from '../../../lib/scripts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LatestUpdate = {
  type: 'post' | 'video' | 'script';
  title: string;
  href: string;
  date?: string;
};

export async function GET() {
  try {
    const [posts, videos, scripts] = await Promise.all([
      getAllPosts(),
      getAllVideos(),
      getAllScripts(),
    ]);

    const latestCandidates: LatestUpdate[] = [
      ...posts.map((post) => ({
        type: 'post' as const,
        title: post.meta.title,
        href: `/blog/${post.slug}`,
        date: post.meta.date,
      })),
      ...videos.map((video) => ({
        type: 'video' as const,
        title: video.meta.title,
        href: `/videos/${video.slug}`,
        date: video.meta.date,
      })),
      ...scripts.map((script) => ({
        type: 'script' as const,
        title: script.meta.title,
        href: `/scripts/${script.slug}`,
        date: script.meta.date,
      })),
    ];

    const latestUpdate = latestCandidates
      .slice()
      .sort((a, b) => {
        const delta = parseDateTimestamp(b.date) - parseDateTimestamp(a.date);
        return delta !== 0 ? delta : a.title.localeCompare(b.title);
      })[0] || null;

    return NextResponse.json({ latestUpdate });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching latest update: ${error}` }, { status: 500 });
  }
}
