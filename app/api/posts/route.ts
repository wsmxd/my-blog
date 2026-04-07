import { NextResponse } from 'next/server';
import { getAllPosts } from '../../../../lib/posts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const posts = await getAllPosts(category);

  return NextResponse.json(posts);
}