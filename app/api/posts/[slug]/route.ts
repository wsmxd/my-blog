import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostMeta } from '../route';

const postsDir = path.join(process.cwd(), 'posts');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;          // ✅ 先 await
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const fullPath = path.join(postsDir, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: `Post not found: ${slug}` }, { status: 404 });
    }

    const file = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(file);

    return NextResponse.json({ slug, meta: data as PostMeta, content });
  } catch (error) {
    return NextResponse.json({ error: `Error fetching post: ${error}` }, { status: 500 });
  }
}