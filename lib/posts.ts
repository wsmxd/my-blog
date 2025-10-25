export type PostMeta = {
  title: string;
  date?: string;
  description?: string;
  tags?: string[];
  cover?: string;
};

export type Post = {
  slug: string;
  meta: PostMeta;
  content: string;
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

// On server: read files directly (more reliable). On client: call API.
export async function getAllPosts(): Promise<Post[]> {
  if (typeof window === 'undefined') {
    // Server-side: use fs to read markdown files directly
    const fs = await import('fs');
    const path = await import('path');
    const matter = (await import('gray-matter')).default;

    const postsDir = path.join(process.cwd(), 'posts');
    if (!fs.existsSync(postsDir)) return [];

    const slugs = fs.readdirSync(postsDir).filter((f: string) => f.endsWith('.md'));
    const posts = slugs
      .map((slug: string) => {
        const realSlug = slug.replace(/\.md$/, '');
        const fullPath = path.join(postsDir, slug);
        const file = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(file);
        const rawCover = (data as PostMeta)?.cover;
        let cover = rawCover || '/images/default-cover.svg';
        // normalize cover: allow absolute (/...), external (http/https) or filename -> /images/filename
        if (typeof cover === 'string' && !cover.startsWith('/') && !/^https?:\/\//i.test(cover)) {
          cover = `/images/${cover}`;
        }
        const meta = {
          ...(data as PostMeta),
          cover,
        } as PostMeta;
        return {
          slug: realSlug,
          meta,
          content,
        } as Post;
      })
      .sort((a: Post, b: Post) => {
        const da = a.meta.date || '';
        const db = b.meta.date || '';
        return db.localeCompare(da);
      });

    return posts;
  }

  // Client-side: fetch from API
  const baseUrl = getBaseUrl();
  const resp = await fetch(`${baseUrl}/api/posts`, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error('Failed to fetch posts');
  return resp.json();
}

export async function getPostBySlug(slug: string): Promise<Post> {
  if (typeof window === 'undefined') {
    const fs = await import('fs');
    const path = await import('path');
    const matter = (await import('gray-matter')).default;

    const postsDir = path.join(process.cwd(), 'posts');
    const filePath = path.join(postsDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Post not found: ${slug}`);
    }
    const file = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(file);
    const rawCover = (data as PostMeta)?.cover;
    let cover = rawCover || '/images/default-cover.svg';
    if (typeof cover === 'string' && !cover.startsWith('/') && !/^https?:\/\//i.test(cover)) {
      cover = `/images/${cover}`;
    }
    const meta = {
      ...(data as PostMeta),
      cover,
    } as PostMeta;
    return { slug, meta, content } as Post;
  }

  const baseUrl = getBaseUrl();
  const resp = await fetch(`${baseUrl}/api/posts/${slug}`, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error(`Failed to fetch post: ${slug}`);
  return resp.json();
}
