import { NextResponse } from 'next/server';
import { getAllVideos } from '../../../lib/videos';
import { getVideoPlayKey } from '../../../lib/upstash';

export async function GET() {
  try {
    const videos = await getAllVideos();
    const perVideo: Record<string, number> = {};

    const { upstashMGet } = await import('../../../lib/upstash');
    const keys = videos.map((v) => getVideoPlayKey(v.slug));
    const vals = await upstashMGet(keys);

    let total = 0;
    videos.forEach((v, i) => {
      const count = Number(vals[i] || 0);
      perVideo[v.slug] = count;
      total += count;
    });

    return NextResponse.json({ videosCount: videos.length, totalPlays: total, perVideo });
  } catch {
    return NextResponse.json({ videosCount: 0, totalPlays: 0, perVideo: {} });
  }
}
