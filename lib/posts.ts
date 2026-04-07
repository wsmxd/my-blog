export type PostMeta = {
  title: string;
  date?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  category?: string;
  folder?: string;
};

export type Post = {
  slug: string;
  meta: PostMeta;
  content: string;
};

type SlugInput = string | string[];

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
  const explicitCategory = (data as PostMeta)?.category;
  const category = explicitCategory || folder;

  return {
    slug: getPostSlug(filePath, postsDir),
    meta: {
      ...(data as PostMeta),
      cover,
      category,
      folder,
    } as PostMeta,
    content,
  };
}

// Helper function to recursively read posts from posts directory and subdirectories
function readPostsRecursive(dir: string, baseDir: string): Post[] {
  const fs = require('fs');
  const path = require('path');

  const posts: Post[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively read subdirectories
      const subPosts = readPostsRecursive(fullPath, baseDir);
      posts.push(...subPosts);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      posts.push(readPostFile(fullPath, baseDir));
    }
  }

  return posts;
}

// Helper function to find post file recursively
function findPostFile(dir: string, baseDir: string, targetSlug: string): string | null {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const result = findPostFile(fullPath, baseDir, targetSlug);
        if (result) return result;
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (getPostSlug(fullPath, baseDir) === targetSlug) {
          return fullPath;
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// On server: read files directly (more reliable). On client: call API.
export async function getAllPosts(category?: string): Promise<Post[]> {
  if (typeof window === 'undefined') {
    // Server-side: use fs to read markdown files directly
    const fs = await import('fs');
    const path = await import('path');

    const postsDir = path.join(process.cwd(), 'posts');
    if (!fs.existsSync(postsDir)) return [];

    let posts = readPostsRecursive(postsDir, postsDir);
    
    posts = posts.sort((a: Post, b: Post) => {
      const da = a.meta.date || '';
      const db = b.meta.date || '';
      return db.localeCompare(da);
    });

    // Filter by category if specified
    if (category) {
      posts = posts.filter(post => post.meta.category === category);
    }

    return posts;
  }

  // Client-side: fetch from API
  const baseUrl = getBaseUrl();
  const url = category ? `${baseUrl}/api/posts?category=${encodeURIComponent(category)}` : `${baseUrl}/api/posts`;
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
    
    const filePath = findPostFile(postsDir, postsDir, decodedSlug);
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
