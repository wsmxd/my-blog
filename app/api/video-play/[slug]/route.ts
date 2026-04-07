import { NextResponse } from 'next/server';
import { getVideoPlayKey } from '../../../../lib/upstash';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const slug = (await params).slug;
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const body = (await req.json().catch(() => null)) as { count?: unknown } | null;
    const inc = Number(body?.count ?? 1) || 1;

    const { upstashIncr } = await import('../../../../lib/upstash');
    const newVal = await upstashIncr(getVideoPlayKey(slug), inc);

    return NextResponse.json({ slug, count: newVal });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const slug = (await params).slug;
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });

    const { upstashGet } = await import('../../../../lib/upstash');
    const val = await upstashGet(getVideoPlayKey(slug));

    return NextResponse.json({ slug, count: val });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
