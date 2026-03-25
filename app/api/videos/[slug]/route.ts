import { NextRequest, NextResponse } from 'next/server';
import { getVideoBySlug } from '../../../../lib/videos';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const video = await getVideoBySlug(slug);
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching video: ${error}` }, { status: 500 });
  }
}
