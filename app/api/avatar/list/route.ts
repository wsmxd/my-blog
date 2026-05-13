import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_BED_PREFIX = 'image-bed/';
const WORKER_IMAGE_LIST_PATH = '/images';
const DEFAULT_LIMIT = 60;

type CursorState = {
  vercel?: string;
  cloudflare?: string;
};

type GalleryBlob = {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  etag: string;
  source: 'vercel' | 'cloudflare';
};

function isGalleryBlob(blob: { pathname: string }): boolean {
  return blob.pathname.startsWith('image-bed/') || blob.pathname.startsWith('images/');
}

function getWorkerImageListUrl(limit: number): string | null {
  const base = process.env.WORKER_UPLOAD_URL?.trim();
  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, '')}${WORKER_IMAGE_LIST_PATH}?limit=${encodeURIComponent(String(limit))}`;
}

function parseCursorState(value: string | null): CursorState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as CursorState;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function serializeCursorState(value: CursorState | null): string | null {
  return value ? JSON.stringify(value) : null;
}

function normalizeVercelBlob(blob: { url: string; downloadUrl: string; pathname: string; size: number; uploadedAt: Date; etag: string }): GalleryBlob {
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt.toISOString(),
    etag: blob.etag,
    source: 'vercel',
  };
}

function normalizeCloudflareBlob(blob: { url: string; downloadUrl: string; pathname: string; size: number; uploadedAt: string; etag: string }): GalleryBlob {
  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
    etag: blob.etag,
    source: 'cloudflare',
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') || DEFAULT_LIMIT);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 100) : DEFAULT_LIMIT;
  const cursorState = parseCursorState(searchParams.get('cursor'));

  try {
    const result = await list({
      limit,
      prefix: IMAGE_BED_PREFIX,
      cursor: cursorState?.vercel,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const blobs: GalleryBlob[] = result.blobs
      .filter(isGalleryBlob)
      .map(normalizeVercelBlob);

    const workerImageListUrl = getWorkerImageListUrl(limit);
    if (workerImageListUrl) {
      try {
        const workerUrl = new URL(workerImageListUrl);
        if (cursorState?.cloudflare) {
          workerUrl.searchParams.set('cursor', cursorState.cloudflare);
        }

        const workerResp = await fetch(workerUrl.toString(), {
          cache: 'no-store',
        });

        if (workerResp.ok) {
          const workerPayload = (await workerResp.json()) as {
            blobs?: Array<{ url: string; downloadUrl: string; pathname: string; size: number; uploadedAt: string; etag: string }>;
            cursor?: string;
            hasMore?: boolean;
          };
          blobs.push(...(workerPayload.blobs || []).filter(isGalleryBlob).map(normalizeCloudflareBlob));

          const hasMore = Boolean(result.hasMore || workerPayload.hasMore);
          const nextCursor = hasMore
            ? serializeCursorState({
                vercel: result.cursor,
                cloudflare: workerPayload.cursor,
              })
            : null;

          const deduped = Array.from(new Map(blobs.map((blob) => [blob.url, blob])).values())
            .sort((left, right) => Date.parse(right.uploadedAt) - Date.parse(left.uploadedAt));

          return NextResponse.json({
            blobs: deduped,
            cursor: nextCursor,
            hasMore,
          });
        } else {
          console.warn('Cloudflare image list failed, returning Vercel Blob items only');
        }
      } catch (workerError) {
        console.warn('Cloudflare image list request failed, returning Vercel Blob items only:', workerError);
      }
    }

    const deduped = Array.from(new Map(blobs.map((blob) => [blob.url, blob])).values())
      .sort((left, right) => Date.parse(right.uploadedAt) - Date.parse(left.uploadedAt));

    const hasMore = Boolean(result.hasMore);
    const nextCursor = hasMore
      ? serializeCursorState({
          vercel: result.cursor,
          cloudflare: cursorState?.cloudflare,
        })
      : null;

    return NextResponse.json({
      blobs: deduped,
      cursor: nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('List error:', error);
    const message = error instanceof Error ? error.message : 'Failed to list blobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
