import { NextResponse } from 'next/server';
import { getPostBySlug } from '../../../../lib/posts';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> } | { params: { slug: string[] } },
) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug];

  try {
    const post = await getPostBySlug(slug);
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching post: ${error}` }, { status: 500 });
  }
}