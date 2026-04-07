import { NextResponse } from 'next/server';
import { getAllPosts } from '../../../lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder') || undefined;
  const posts = await getAllPosts(folder);

  return NextResponse.json(posts);
}