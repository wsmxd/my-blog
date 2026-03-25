import { NextResponse } from 'next/server';
import { getAllVideos } from '../../../lib/videos';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const videos = await getAllVideos(category);
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: `Error fetching videos: ${error}` }, { status: 500 });
  }
}
