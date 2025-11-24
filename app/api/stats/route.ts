
import { NextResponse } from 'next/server';
import { getAllPosts } from '../../../lib/posts';

export async function GET() {
  try {
    const posts = await getAllPosts();
    const perPost: Record<string, number> = {};
    let total = 0;

    // 只用 Upstash 聚合统计
    const { upstashMGet } = await import('../../../lib/upstash');
    const keys = posts.map((p) => `reads:${p.slug}`);
    const vals = await upstashMGet(keys);
    posts.forEach((p, i) => {
      const v = Number(vals[i] || 0);
      perPost[p.slug] = v;
      total += v;
    });

    return NextResponse.json({ postsCount: posts.length, totalReads: total, perPost });
  } catch {
    return NextResponse.json({ postsCount: 0, totalReads: 0, perPost: {} });
  }
}
