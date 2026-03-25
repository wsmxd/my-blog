export type VideoMeta = {
  title: string;
  date?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  category?: string;
  duration?: string;
  videoUrl: string;
};

export type Video = {
  slug: string;
  meta: VideoMeta;
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

function normalizeVideoMeta(meta: Partial<VideoMeta>): VideoMeta {
  const normalizedDate =
    typeof meta.date === 'string'
      ? meta.date
      : meta.date
        ? String(meta.date)
        : undefined;

  return {
    title: meta.title || '未命名视频',
    date: normalizedDate,
    description: meta.description,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    category: meta.category,
    duration: meta.duration || '未知时长',
    cover: typeof meta.cover === 'string' && meta.cover.trim() ? meta.cover : '/images/default-cover.svg',
    videoUrl: typeof meta.videoUrl === 'string' ? meta.videoUrl : '',
  };
}

export async function getAllVideos(category?: string): Promise<Video[]> {
  if (typeof window === 'undefined') {
    const fs = await import('fs');
    const path = await import('path');
    const matter = (await import('gray-matter')).default;

    const videosDir = path.join(process.cwd(), 'videos');
    if (!fs.existsSync(videosDir)) return [];

    const slugs = fs.readdirSync(videosDir).filter((f: string) => f.endsWith('.md'));
    let videos = slugs
      .map((slug: string) => {
        const realSlug = slug.replace(/\.md$/, '');
        const fullPath = path.join(videosDir, slug);
        const file = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(file);
        const normalized = normalizeVideoMeta(data as Partial<VideoMeta>);
        return {
          slug: realSlug,
          meta: normalized,
          content,
        } as Video;
      })
      .filter((video) => Boolean(video.meta.videoUrl))
      .sort((a: Video, b: Video) => {
        const da = String(a.meta.date || '');
        const db = String(b.meta.date || '');
        return db.localeCompare(da);
      });

    if (category) {
      videos = videos.filter((video) => video.meta.category === category);
    }

    return videos;
  }

  const baseUrl = getBaseUrl();
  const url = category ? `${baseUrl}/api/videos?category=${encodeURIComponent(category)}` : `${baseUrl}/api/videos`;
  const resp = await fetch(url, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error('Failed to fetch videos');
  return resp.json();
}

export async function getVideoBySlug(slug: string): Promise<Video> {
  if (typeof window === 'undefined') {
    const fs = await import('fs');
    const path = await import('path');
    const matter = (await import('gray-matter')).default;

    const videosDir = path.join(process.cwd(), 'videos');
    const decodedSlug = decodeURIComponent(slug);
    const filePath = path.join(videosDir, `${decodedSlug}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Video not found: ${slug}`);
    }

    const file = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(file);
    const normalized = normalizeVideoMeta(data as Partial<VideoMeta>);

    if (!normalized.videoUrl) {
      throw new Error(`Missing videoUrl in frontmatter: ${slug}`);
    }

    return {
      slug,
      meta: normalized,
      content,
    } as Video;
  }

  const baseUrl = getBaseUrl();
  const resp = await fetch(`${baseUrl}/api/videos/${slug}`, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error(`Failed to fetch video: ${slug}`);
  return resp.json();
}
