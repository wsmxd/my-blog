import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const POST_IMAGE_PREFIX = 'post-bed/';
const WORKER_POST_UPLOAD_PATH = '/post-upload';
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function getRequiredUploadToken(): string | null {
  return process.env.UPLOAD_API_TOKEN?.trim() || process.env.BLOB_UPLOAD_TOKEN?.trim() || null;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function normalizeFilename(filename: string): string {
  const cleaned = filename
    .trim()
    .replace(/[/\\]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^\w.()-]/g, '_');

  return cleaned || 'image';
}

function getWorkerPostUploadUrl(filename: string): string | null {
  const base = process.env.WORKER_UPLOAD_URL?.trim();
  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, '')}${WORKER_POST_UPLOAD_PATH}?filename=${encodeURIComponent(filename)}`;
}

async function uploadToWorkerPostStore(
  filename: string,
  contentType: string,
  body: ArrayBuffer,
): Promise<{ url: string; downloadUrl: string; pathname: string; contentType: string; etag?: string; source: 'cloudflare' } | null> {
  const workerUrl = getWorkerPostUploadUrl(filename);
  if (!workerUrl) {
    return null;
  }

  const requiredToken = process.env.UPLOAD_API_TOKEN?.trim() || process.env.BLOB_UPLOAD_TOKEN?.trim() || null;
  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      ...(requiredToken ? { Authorization: `Bearer ${requiredToken}` } : {}),
    },
    body,
  });

  const result = (await response.json().catch(() => null)) as {
    url?: string;
    downloadUrl?: string;
    pathname?: string;
    contentType?: string;
    etag?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    console.warn('Cloudflare post image upload skipped:', response.status, result?.error || response.statusText);
    return null;
  }

  if (!result?.url || !result.pathname) {
    console.warn('Cloudflare post image upload returned an invalid response');
    return null;
  }

  return {
    url: result.url,
    downloadUrl: result.downloadUrl || result.url,
    pathname: result.pathname,
    contentType: result.contentType || contentType,
    etag: result.etag,
    source: 'cloudflare',
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const requiredToken = getRequiredUploadToken();
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!request.body) {
    return NextResponse.json({ error: 'Request body is null' }, { status: 400 });
  }

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  if (requiredToken && bearer !== requiredToken) {
    return unauthorized();
  }

  const contentType = request.headers.get('content-type')?.split(';')[0].trim() || '';
  if (!allowedMimeTypes.has(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported content type. Allowed: jpg, png, webp, gif, avif' },
      { status: 400 },
    );
  }

  try {
    const body = await request.arrayBuffer();
    if (!body.byteLength) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    const normalizedFilename = normalizeFilename(filename);

    const cloudflareBlob = await uploadToWorkerPostStore(normalizedFilename, contentType, body);
    if (cloudflareBlob) {
      return NextResponse.json(cloudflareBlob);
    }

    const blob = await put(`${POST_IMAGE_PREFIX}${normalizedFilename}`, body, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
      contentType,
    });

    return NextResponse.json({
      ...blob,
      source: 'vercel',
    });
  } catch (error) {
    console.error('Post image upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}