import { NextResponse } from 'next/server';
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostMeta = {
  title: string;
  date?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  category?: string;
};

const postsDir = path.join(process.cwd(), "posts");

function getPostSlugs() {
  try {
    return fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  } catch (error) {
    console.error("Error reading posts directory:", error);
    return [];
  }
}

function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDir, `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${fullPath}`);
  }

  const file = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(file);
  return {
    slug: realSlug,
    meta: data as PostMeta,
    content,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  let posts = getPostSlugs()
    .map((slug) => {
      const p = getPostBySlug(slug);
      // ensure default cover if missing and normalize
      const rawCover = p.meta?.cover;
      let cover: string = '/images/default-cover.svg';
      // Keep absolute (/...), external (http/https) or bare filenames as-is.
      if (typeof rawCover === 'string' && rawCover.trim().length > 0) {
        cover = rawCover;
      }
      p.meta = {
        ...(p.meta || {}),
        cover,
      };
      return p;
    })
    .sort((a, b) => {
      const da = a.meta.date || "";
      const db = b.meta.date || "";
      return db.localeCompare(da);
    });

  // Filter by category if specified
  if (category) {
    posts = posts.filter(post => post.meta.category === category);
  }

  return NextResponse.json(posts);
}