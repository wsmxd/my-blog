interface Env {
  VIDEO_BUCKET: R2Bucket;
  ALLOWED_ORIGINS?: string;
  PUBLIC_BASE_URL?: string;
  MAX_UPLOAD_MB?: string;
  UPLOAD_TOKEN?: string;
}

const allowedMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

function buildPublicUrl(env: Env, key: string): string {
  const base = (env.PUBLIC_BASE_URL || 'https://media.wsmxd.top').trim();
  return `${base.replace(/\/$/, '')}/${key.replace(/^\/+/, '')}`;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const isUploadPath = url.pathname === '/upload' || url.pathname.endsWith('/upload');

    if (!isUploadPath || request.method !== 'POST') {
      return json({ error: 'Not found' }, 404, corsHeaders(request, env));
    }

    const requiredToken = (env.UPLOAD_TOKEN || '').trim();
    if (requiredToken) {
      const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
      if (!bearer || bearer !== requiredToken) {
        return json({ error: 'Unauthorized' }, 401, corsHeaders(request, env));
      }
    }

    const filename = url.searchParams.get('filename');
    if (!filename) {
      return json({ error: 'Filename is required' }, 400, corsHeaders(request, env));
    }

    const contentType = request.headers.get('content-type') || '';
    if (!allowedMimeTypes.has(contentType)) {
      return json({ error: 'Unsupported content type. Allowed: mp4, webm, ogg, mov' }, 400, corsHeaders(request, env));
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

    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const baseName = filename.replace(/\.[^.]+$/, '');
    const safeName = sanitizeFileName(baseName) || 'video';
    const safeExt = sanitizeFileName(ext.replace('.', ''));
    const now = new Date();
    const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const key = `videos/${path}/${Date.now()}-${safeName}${safeExt ? `.${safeExt}` : ''}`;

    await env.VIDEO_BUCKET.put(key, bytes, {
      httpMetadata: { contentType },
    });

    return json(
      {
        key,
        url: buildPublicUrl(env, key),
        contentType,
        size: bytes.byteLength,
      },
      200,
      corsHeaders(request, env),
    );
  },
};

export default worker;
