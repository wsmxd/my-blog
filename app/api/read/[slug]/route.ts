
import { NextResponse } from 'next/server';
import { upstashIncr, upstashGet } from '../../../../lib/upstash';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> } | { params: { slug: string } },
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const inc = Number(body?.count ?? 1) || 1;

  try {
    const key = `reads:${slug}`;
    const newVal = await upstashIncr(key, inc);
    return NextResponse.json({ slug, count: newVal });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> } | { params: { slug: string } },
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const key = `reads:${slug}`;
    const val = await upstashGet(key);
    return NextResponse.json({ slug, count: val });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
