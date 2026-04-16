export type ScriptMeta = {
  title: string;
  tags?: string[];
  description?: string;
  date?: string;
};

export type ScriptItem = {
  slug: string;
  meta: ScriptMeta;
  content: string;
};

type SlugInput = string | string[];

function normalizeDateValue(date: unknown): string | undefined {
  if (!date) return undefined;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
  }

  if (typeof date === 'number') {
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString().slice(0, 10);
  }

  if (typeof date === 'string') {
    const normalized = date.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

export function parseDateTimestamp(date?: unknown): number {
  const normalizedDate = normalizeDateValue(date);
  if (!normalizedDate) return Number.NEGATIVE_INFINITY;

  const timestamp = Date.parse(normalizedDate);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function normalizeScriptMeta(meta: Partial<ScriptMeta>): ScriptMeta {
  return {
    title: typeof meta.title === 'string' && meta.title.trim() ? meta.title : '未命名脚本',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    description: typeof meta.description === 'string' ? meta.description : undefined,
    date: normalizeDateValue(meta.date),
  };
}

export async function getAllScripts(): Promise<ScriptItem[]> {
  if (typeof window !== 'undefined') {
    throw new Error('getAllScripts only supports server side usage');
  }

  const fs = await import('fs');
  const path = await import('path');
  const matter = (await import('gray-matter')).default;

  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) return [];

  return fs
    .readdirSync(scriptsDir)
    .filter((fileName: string) => fileName.endsWith('.md'))
    .map((fileName: string) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(scriptsDir, fileName);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContent);

      return {
        slug,
        meta: normalizeScriptMeta(data as Partial<ScriptMeta>),
        content,
      } as ScriptItem;
    })
    .sort((a, b) => {
      const delta = parseDateTimestamp(b.meta.date) - parseDateTimestamp(a.meta.date);
      return delta !== 0 ? delta : a.meta.title.localeCompare(b.meta.title);
    });
}

export async function getScriptBySlug(slug: SlugInput): Promise<ScriptItem> {
  if (typeof window !== 'undefined') {
    throw new Error('getScriptBySlug only supports server side usage');
  }

  const fs = await import('fs');
  const path = await import('path');
  const matter = (await import('gray-matter')).default;

  const scriptsDir = path.join(process.cwd(), 'scripts');
  const normalizedSlug = decodeURIComponent(Array.isArray(slug) ? slug.join('/') : slug);
  const fullPath = path.join(scriptsDir, `${normalizedSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Script not found: ${normalizedSlug}`);
  }

  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    slug: normalizedSlug,
    meta: normalizeScriptMeta(data as Partial<ScriptMeta>),
    content,
  };
}
