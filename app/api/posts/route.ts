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

export async function GET() {
  const posts = getPostSlugs()
    .map((slug) => {
      const p = getPostBySlug(slug);
      // ensure default cover if missing and normalize
      const rawCover = p.meta?.cover;
      let cover = rawCover || '/images/default-cover.svg';
      if (typeof cover === 'string' && !cover.startsWith('/') && !/^https?:\/\//i.test(cover)) {
        cover = `/images/${cover}`;
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

  return NextResponse.json(posts);
}