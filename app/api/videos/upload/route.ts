import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_MAX_MB = 200;
const WORKER_UPLOAD_PATH = '/upload';
const allowedMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function getWorkerUploadUrl(filename: string): string | null {
  const base = process.env.WORKER_UPLOAD_URL?.trim();
  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, '')}${WORKER_UPLOAD_PATH}?filename=${encodeURIComponent(filename)}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  const workerUrl = getWorkerUploadUrl(filename);
  if (!workerUrl) {
    return NextResponse.json(
      { error: 'Missing required env: WORKER_UPLOAD_URL' },
      { status: 500 },
    );
  }

  const requiredToken = process.env.VIDEO_UPLOAD_TOKEN?.trim();
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (requiredToken) {
    if (!bearer || bearer !== requiredToken) {
      return unauthorized();
    }
  }

  const contentType = request.headers.get('content-type') || '';
  if (!allowedMimeTypes.has(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported content type. Allowed: mp4, webm, ogg, mov' },
      { status: 400 },
    );
  }

  const maxMb = Number(process.env.VIDEO_UPLOAD_MAX_MB || process.env.WORKER_MAX_UPLOAD_MB || DEFAULT_MAX_MB);
  const maxBytes = Math.max(1, maxMb) * 1024 * 1024;

  try {
    const arrayBuffer = await request.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    if (arrayBuffer.byteLength > maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max allowed size is ${maxMb}MB` },
        { status: 413 },
      );
    }

    const workerResp = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: arrayBuffer,
    });

    const result = await workerResp.json().catch(() => null);
    if (!workerResp.ok) {
      return NextResponse.json(
        { error: (result as { error?: string } | null)?.error || 'Worker upload failed' },
        { status: workerResp.status },
      );
    }

    return NextResponse.json(result || { ok: true });
  } catch (error) {
    console.error('Worker proxy upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
