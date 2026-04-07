import { NextResponse } from 'next/server';
import { getReadKey, upstashIncr, upstashGet } from '../../../../lib/upstash';

function normalizeSlug(slug: string | string[]): string {
  return decodeURIComponent(Array.isArray(slug) ? slug.join('/') : slug);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> } | { params: { slug: string[] } },
) {
  const resolvedParams = await params;
  const slug = normalizeSlug(resolvedParams.slug);
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { count?: unknown } | null;
  const inc = Number(body?.count ?? 1) || 1;

  try {
    const key = getReadKey(slug);
    const newVal = await upstashIncr(key, inc);
    return NextResponse.json({ slug, count: newVal });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> } | { params: { slug: string[] } },
) {
  const resolvedParams = await params;
  const slug = normalizeSlug(resolvedParams.slug);
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const key = getReadKey(slug);
    const val = await upstashGet(key);
    return NextResponse.json({ slug, count: val });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}