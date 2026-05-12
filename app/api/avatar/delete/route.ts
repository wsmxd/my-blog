import { del, BlobNotFoundError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type DeleteSource = 'cloudflare' | 'vercel';

function getRequiredUploadToken(): string | null {
  return process.env.UPLOAD_API_TOKEN?.trim() || process.env.BLOB_UPLOAD_TOKEN?.trim() || null;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function getWorkerImageDeleteUrl(pathname: string): string | null {
  const base = process.env.WORKER_UPLOAD_URL?.trim();
  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, '')}/image-delete?pathname=${encodeURIComponent(pathname)}`;
}

function inferSource(pathname: string): DeleteSource {
  if (pathname.startsWith('images/') || pathname.startsWith('posts/')) {
    return 'cloudflare';
  }

  return 'vercel';
}

async function deleteFromCloudflare(pathname: string): Promise<void> {
  const workerUrl = getWorkerImageDeleteUrl(pathname);
  if (!workerUrl) {
    throw new Error('WORKER_UPLOAD_URL is not configured');
  }

  const requiredToken = process.env.UPLOAD_API_TOKEN?.trim() || process.env.BLOB_UPLOAD_TOKEN?.trim() || null;
  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      ...(requiredToken ? { Authorization: `Bearer ${requiredToken}` } : {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Cloudflare delete failed: ${response.status}`);
  }
}

async function deleteFromVercel(pathname: string): Promise<void> {
  try {
    await del(pathname, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return;
    }

    throw error;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const requiredToken = getRequiredUploadToken();
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (requiredToken && bearer !== requiredToken) {
    return unauthorized();
  }

  let body: { pathname?: string; source?: DeleteSource };
  try {
    body = (await request.json()) as { pathname?: string; source?: DeleteSource };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const pathname = body.pathname?.trim();
  if (!pathname) {
    return NextResponse.json({ error: 'pathname is required' }, { status: 400 });
  }

  const source = body.source || inferSource(pathname);

  try {
    if (source === 'cloudflare') {
      await deleteFromCloudflare(pathname);
    } else {
      await deleteFromVercel(pathname);
    }

    return NextResponse.json({ deleted: true, pathname, source });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 },
    );
  }
}