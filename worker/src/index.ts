interface Env {
  VIDEO_BUCKET: R2Bucket;
  IMAGE_BUCKET: R2Bucket;
  ALLOWED_ORIGINS?: string;
  PUBLIC_BASE_URL?: string;
  IMAGE_PUBLIC_BASE_URL?: string;
  VIDEO_PUBLIC_BASE_URL?: string;
  MAX_UPLOAD_MB?: string;
  UPLOAD_TOKEN?: string;
}

const allowedMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);

const imageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const IMAGE_PATH_PREFIX = 'images';

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function getAllowedOrigin(request: Request, env: Env): string {
  const origin = request.headers.get('origin') || '';
  const raw = env.ALLOWED_ORIGINS || '';
  const allowList = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (!origin || allowList.length === 0) {
    return '*';
  }

  return allowList.includes(origin) ? origin : '';
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const allowOrigin = getAllowedOrigin(request, env);
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function sanitizeFileName(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function buildPublicUrl(env: Env, key: string, mediaType: 'image' | 'video'): string {
  const typeBase = mediaType === 'image' ? env.IMAGE_PUBLIC_BASE_URL : env.VIDEO_PUBLIC_BASE_URL;
  const base = (typeBase || env.PUBLIC_BASE_URL || 'https://media.wsmxd.top').trim();
  return `${base.replace(/\/$/, '')}/${key.replace(/^\/+/, '')}`;
}

function buildMediaKey(folder: string, filename: string): string {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
  const baseName = filename.replace(/\.[^.]+$/, '');
  const safeName = sanitizeFileName(baseName) || 'file';
  const safeExt = sanitizeFileName(ext.replace('.', ''));
  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${folder}/${path}/${Date.now()}-${safeName}${safeExt ? `.${safeExt}` : ''}`;
}

function getUploadToken(env: Env): string {
  return (env.UPLOAD_TOKEN || '').trim();
}

function requireBearer(request: Request, env: Env): boolean {
  const requiredToken = getUploadToken(env);
  if (!requiredToken) {
    return true;
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  return Boolean(bearer && bearer === requiredToken);
}

function isUploadPath(pathname: string): boolean {
  return pathname === '/upload' || pathname.endsWith('/upload') || pathname === '/image-upload' || pathname.endsWith('/image-upload');
}

function toStoredObject(env: Env, key: string, size: number, uploadedAt: Date, etag: string) {
  return {
    url: buildPublicUrl(env, key, 'image'),
    downloadUrl: buildPublicUrl(env, key, 'image'),
    pathname: key,
    size,
    uploadedAt: uploadedAt.toISOString(),
    etag,
  };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const isImageUploadPath = url.pathname === '/image-upload' || url.pathname.endsWith('/image-upload');
    const isImageListPath = url.pathname === '/images' || url.pathname.endsWith('/images');
    const isImageDeletePath = url.pathname === '/image-delete' || url.pathname.endsWith('/image-delete');
    const isVideoUploadPath = !isImageUploadPath && (url.pathname === '/upload' || url.pathname.endsWith('/upload'));
    const publicImageKey = url.pathname.match(/(?:^|\/)(images\/.+)$/)?.[1];
    const publicVideoKey = url.pathname.match(/(?:^|\/)(videos\/.+)$/)?.[1];

    if ((request.method === 'GET' || request.method === 'HEAD') && (publicImageKey || publicVideoKey)) {
      const key = publicImageKey || publicVideoKey || '';
      const object = publicImageKey
        ? await env.IMAGE_BUCKET.get(key)
        : await env.VIDEO_BUCKET.get(key);

      if (!object) {
        return new Response('Not found', { status: 404, headers: corsHeaders(request, env) });
      }

      const headers = new Headers(corsHeaders(request, env));
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return new Response(request.method === 'HEAD' ? null : object.body, { headers });
    }

    if (isImageListPath && request.method === 'GET') {
      const limitParam = Number(url.searchParams.get('limit') || '60');
      const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 100) : 60;
      const cursor = url.searchParams.get('cursor') || undefined;

      const result = await env.IMAGE_BUCKET.list({
        prefix: `${IMAGE_PATH_PREFIX}/`,
        limit,
        cursor,
      });

      const nextCursor = 'cursor' in result ? result.cursor : undefined;

      return json(
        {
          blobs: result.objects.map((object) => {
            const uploadedAt = (object as { uploaded?: Date; uploadedAt?: Date }).uploaded ?? (object as { uploadedAt?: Date }).uploadedAt ?? new Date();
            const etag = (object as { httpEtag?: string; etag?: string }).httpEtag ?? (object as { etag?: string }).etag ?? '';
            return toStoredObject(env, object.key, object.size, uploadedAt, etag);
          }),
          cursor: nextCursor,
          hasMore: result.truncated,
        },
        200,
        corsHeaders(request, env),
      );
    }

    if (isImageDeletePath && request.method === 'POST') {
      if (!requireBearer(request, env)) {
        return json({ error: 'Unauthorized' }, 401, corsHeaders(request, env));
      }

      const pathname = url.searchParams.get('pathname');
      if (!pathname) {
        return json({ error: 'pathname is required' }, 400, corsHeaders(request, env));
      }

      await env.IMAGE_BUCKET.delete(pathname);

      return json(
        {
          deleted: true,
          pathname,
        },
        200,
        corsHeaders(request, env),
      );
    }

    if (!isUploadPath(url.pathname) || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404, corsHeaders(request, env));
    }

    if (!requireBearer(request, env)) {
      return json({ error: 'Unauthorized' }, 401, corsHeaders(request, env));
    }

    const filename = url.searchParams.get('filename');
    if (!filename) {
      return json({ error: 'Filename is required' }, 400, corsHeaders(request, env));
    }

    const contentType = request.headers.get('content-type') || '';
    if (isImageUploadPath) {
      if (!imageMimeTypes.has(contentType)) {
        return json({ error: 'Unsupported content type. Allowed: jpg, png, webp, gif, avif' }, 400, corsHeaders(request, env));
      }
    } else if (isVideoUploadPath) {
      if (!allowedMimeTypes.has(contentType)) {
        return json({ error: 'Unsupported content type. Allowed: mp4, webm, ogg, mov' }, 400, corsHeaders(request, env));
      }
    } else {
      return json({ error: 'Not found' }, 404, corsHeaders(request, env));
    }

    const maxMb = Number(env.MAX_UPLOAD_MB || '200');
    const maxBytes = Math.max(1, maxMb) * 1024 * 1024;

    let bytes: ArrayBuffer;
    try {
      bytes = await request.arrayBuffer();
    } catch {
      return json({ error: 'Invalid request body' }, 400, corsHeaders(request, env));
    }

    if (!bytes.byteLength) {
      return json({ error: 'Request body is empty' }, 400, corsHeaders(request, env));
    }

    if (bytes.byteLength > maxBytes) {
      return json({ error: `File too large. Max allowed size is ${maxMb}MB` }, 413, corsHeaders(request, env));
    }

    const key = isImageUploadPath
      ? buildMediaKey(IMAGE_PATH_PREFIX, filename)
      : buildMediaKey('videos', filename);

    const bucket = isImageUploadPath ? env.IMAGE_BUCKET : env.VIDEO_BUCKET;
    await bucket.put(key, bytes, {
      httpMetadata: { contentType },
    });

    return json(
      {
        key,
        pathname: key,
        url: buildPublicUrl(env, key, isImageUploadPath ? 'image' : 'video'),
        downloadUrl: buildPublicUrl(env, key, isImageUploadPath ? 'image' : 'video'),
        contentType,
        size: bytes.byteLength,
      },
      200,
      corsHeaders(request, env),
    );
  },
};

export default worker;
