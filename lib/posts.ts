export type PostMeta = {
  title: string;
  date?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  folder?: string;
};

export type Post = {
  slug: string;
  meta: PostMeta;
  content: string;
};

type SlugInput = string | string[];

const POSTS_CACHE_TTL_MS = 15_000;
let cachedAllPosts: Post[] | null = null;
let cachedAt = 0;

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

function normalizeSlugInput(slug: SlugInput): string {
  const joinedSlug = Array.isArray(slug) ? slug.join('/') : slug;
  return decodeURIComponent(joinedSlug);
}

function getPostFolder(filePath: string, postsDir: string): string | undefined {
  const path = require('path');
  const relativeFolder = path.relative(postsDir, path.dirname(filePath));
  return relativeFolder && relativeFolder !== '.' ? relativeFolder.replace(/\\/g, '/') : undefined;
}

function getPostSlug(filePath: string, postsDir: string): string {
  const path = require('path');
  const fileName = path.basename(filePath, '.md');
  const folder = getPostFolder(filePath, postsDir);
  return folder ? `${folder}/${fileName}` : fileName;
}

function readPostFile(filePath: string, postsDir: string): Post {
  const fs = require('fs');
  const matter = require('gray-matter');
  const file = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(file);

  const rawCover = (data as PostMeta)?.cover;
  let cover: string = '/images/default-cover.svg';
  if (typeof rawCover === 'string' && rawCover.trim().length > 0) {
    cover = rawCover;
  }

  const folder = getPostFolder(filePath, postsDir);
  const { category: _ignoredCategory, ...postData } = data as PostMeta & { category?: string };

  return {
    slug: getPostSlug(filePath, postsDir),
    meta: {
      ...postData,
      cover,
      folder,
    } as PostMeta,
    content,
  };
}

// Read markdown files from posts root and one-level subfolders only.
function readPostsOneLevel(postsDir: string): Post[] {
  const fs = require('fs');
  const path = require('path');

  const posts: Post[] = [];
  const entries = fs.readdirSync(postsDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(postsDir, entry.name);

    if (entry.isFile() && entry.name.endsWith('.md')) {
      posts.push(readPostFile(fullPath, postsDir));
      continue;
    }

    if (entry.isDirectory()) {
      const childEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const child of childEntries) {
        if (!child.isFile() || !child.name.endsWith('.md')) continue;
        const childPath = path.join(fullPath, child.name);
        posts.push(readPostFile(childPath, postsDir));
      }
    }
  }

  return posts;
}

// Find a post file by slug from posts root and one-level subfolders.
function findPostFile(postsDir: string, targetSlug: string): string | null {
  const fs = require('fs');
  const path = require('path');

  try {
    const entries = fs.readdirSync(postsDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(postsDir, entry.name);

      if (entry.isFile() && entry.name.endsWith('.md')) {
        if (getPostSlug(fullPath, postsDir) === targetSlug) return fullPath;
        continue;
      }

      if (entry.isDirectory()) {
        const childEntries = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const child of childEntries) {
          if (!child.isFile() || !child.name.endsWith('.md')) continue;
          const childPath = path.join(fullPath, child.name);
          if (getPostSlug(childPath, postsDir) === targetSlug) {
            return childPath;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// On server: read files directly (more reliable). On client: call API.
export async function getAllPosts(folder?: string): Promise<Post[]> {
  if (typeof window === 'undefined') {
    const now = Date.now();
    if (cachedAllPosts && now - cachedAt < POSTS_CACHE_TTL_MS) {
      if (!folder) return cachedAllPosts;
      return cachedAllPosts.filter((post) => post.meta.folder === folder);
    }

    // Server-side: use fs to read markdown files directly
    const fs = await import('fs');
    const path = await import('path');

    const postsDir = path.join(process.cwd(), 'posts');
    if (!fs.existsSync(postsDir)) return [];

    let posts = readPostsOneLevel(postsDir);
    
    posts = posts.sort((a: Post, b: Post) => {
      const da = a.meta.date || '';
      const db = b.meta.date || '';
      return db.localeCompare(da);
    });

    cachedAllPosts = posts;
    cachedAt = now;

    // Filter by folder if specified
    if (folder) {
      posts = posts.filter(post => post.meta.folder === folder);
    }

    return posts;
  }

  // Client-side: fetch from API
  const baseUrl = getBaseUrl();
  const url = folder ? `${baseUrl}/api/posts?folder=${encodeURIComponent(folder)}` : `${baseUrl}/api/posts`;
  const resp = await fetch(url, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error('Failed to fetch posts');
  return resp.json();
}

export async function getPostBySlug(slug: SlugInput): Promise<Post> {
  if (typeof window === 'undefined') {
    const fs = await import('fs');
    const path = await import('path');

    const postsDir = path.join(process.cwd(), 'posts');
    // Decode URI encoded slugs (e.g. "avalonia%20bindings" -> "avalonia bindings")
    const decodedSlug = normalizeSlugInput(slug);

    const filePath = findPostFile(postsDir, decodedSlug);
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error(`Post not found: ${slug}`);
    }
    
    return readPostFile(filePath, postsDir);
  }

  const baseUrl = getBaseUrl();
  const resp = await fetch(`${baseUrl}/api/posts/${slug}`, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error(`Failed to fetch post: ${slug}`);
  return resp.json();
}
