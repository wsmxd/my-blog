'use client';

import Link from 'next/link';
import PrefixedImage from '../components/PrefixedImage';
import styles from './page.module.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type GalleryBlob = {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  etag: string;
  source: 'vercel' | 'cloudflare';
};

type CursorState = {
  vercel?: string;
  cloudflare?: string;
};

type PreviewImage = GalleryBlob & {
  fileName: string;
};

const PAGE_SIZE = 30;
const frameRatios = ['4 / 5', '1 / 1', '3 / 4', '5 / 7', '4 / 3', '2 / 3'];

function parseAspectRatio(value: string): number {
  const [widthPart, heightPart] = value.split('/').map((part) => Number(part.trim()));
  if (!Number.isFinite(widthPart) || !Number.isFinite(heightPart) || heightPart <= 0) {
    return 1;
  }

  return widthPart / heightPart;
}

function softCompressAspectRatio(ratio: number): number {
  if (ratio < 0.6) {
    return 0.6;
  }

  if (ratio <= 1) {
    return ratio;
  }

  return 1 + (ratio - 1) * 0.45;
}

function formatAspectRatio(value: number): string {
  return `${Math.max(value, 0.2).toFixed(3)} / 1`;
}

function buildAuthHeaders(tokenValue: string): HeadersInit {
  const value = tokenValue.trim();
  return value ? { Authorization: `Bearer ${value}` } : {};
}

function parseCursor(value: string | null): CursorState | null {
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

function mergeUnique(items: GalleryBlob[]): GalleryBlob[] {
  const map = new Map<string, GalleryBlob>();
  for (const item of items) {
    map.set(item.url, item);
  }

  return Array.from(map.values()).sort((left, right) => Date.parse(right.uploadedAt) - Date.parse(left.uploadedAt));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getFileName(pathname: string): string {
  return pathname.split('/').pop() || pathname;
}

export default function ImagesPage() {
  const [items, setItems] = useState<GalleryBlob[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [imageSizes, setImageSizes] = useState<Record<string, { w: number; h: number }>>({});
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<CursorState | null>(null);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const previewCloseTimerRef = useRef<number | null>(null);

  const loadPage = useCallback(async (reset = false) => {
    if (isLoadingRef.current) {
      return;
    }

    if (!reset && !hasMoreRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      const nextCursor = reset ? null : cursorRef.current;
      if (nextCursor) {
        params.set('cursor', JSON.stringify(nextCursor));
      }

      const response = await fetch(`/api/avatar/list?${params.toString()}`, {
        headers: buildAuthHeaders(token),
        cache: 'no-store',
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || '加载图床失败');
      }

      const payload = (await response.json()) as { blobs?: GalleryBlob[]; cursor?: string | null; hasMore?: boolean };
      const nextItems = payload.blobs || [];
      const nextCursorState = payload.cursor ? parseCursor(payload.cursor) : null;
      const nextHasMore = Boolean(payload.hasMore);

      setItems((current) => (reset ? mergeUnique(nextItems) : mergeUnique([...current, ...nextItems])));
      setHasMore(nextHasMore);
      cursorRef.current = nextCursorState;
      hasMoreRef.current = nextHasMore;
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载图床失败');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [token]);

  useEffect(() => {
    void loadPage(true);
  }, [loadPage]);

  useEffect(() => {
    const savedToken = localStorage.getItem('uploadToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage]);

  useEffect(() => {
    return () => {
      if (previewCloseTimerRef.current !== null) {
        window.clearTimeout(previewCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isInitialized) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          void loadPage(false);
        }
      },
      { rootMargin: '900px 0px 900px 0px', threshold: 0.01 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isInitialized, loadPage]);

  const refresh = async () => {
    setItems([]);
    setHasMore(true);
    cursorRef.current = null;
    hasMoreRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await loadPage(true);
  };

  const updateToken = (value: string) => {
    setToken(value);
    const normalized = value.trim();
    if (normalized) {
      localStorage.setItem('uploadToken', normalized);
    } else {
      localStorage.removeItem('uploadToken');
    }
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    window.setTimeout(() => {
      setCopiedUrl((current) => (current === url ? null : current));
    }, 2000);
  };

  const deleteImage = async (item: GalleryBlob) => {
    if (!token.trim()) {
      setError('请输入访问令牌后再删除图片');
      return;
    }

    const confirmed = window.confirm(`确定删除这张图片吗？\n\n${item.pathname}`);
    if (!confirmed) {
      return;
    }

    setDeletingUrl(item.url);
    setError(null);

    try {
      const response = await fetch('/api/avatar/delete', {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pathname: item.pathname, source: item.source }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || '删除失败');
      }

      setItems((current) => current.filter((entry) => entry.url !== item.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleImageLoad = useCallback((url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImageSizes((prev) => {
        if (prev[url]) return prev;
        return { ...prev, [url]: { w: img.naturalWidth, h: img.naturalHeight } };
      });
    }
  }, []);

  const openPreview = (item: GalleryBlob, fileName: string) => {
    if (previewCloseTimerRef.current !== null) {
      window.clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }

    setPreviewImage({ ...item, fileName });
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);

    if (previewCloseTimerRef.current !== null) {
      window.clearTimeout(previewCloseTimerRef.current);
    }

    previewCloseTimerRef.current = window.setTimeout(() => {
      setPreviewImage(null);
      previewCloseTimerRef.current = null;
    }, 180);
  };

  const summaryText = useMemo(() => {
    if (error) return error;
    if (!isInitialized) return '加载中';
    if (!items.length) return '空图库';
    return `${items.length} 张`;
  }, [error, isInitialized, items.length]);

  return (
    <main className={`${styles.page} ${styles.pageScroll}`}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />
      <div className={styles.noise} />

      <section className={styles.hero} aria-label="图床图库">
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.backLink}>
            mxd
          </Link>
          <div>
            <h1 className={styles.title}>图床</h1>
            <p className={styles.metaLine}>R2 + Blob / {summaryText}</p>
          </div>
        </div>

        <div className={styles.actions} aria-label="图库操作">
          <button type="button" className={styles.ghostButton} onClick={() => void refresh()} disabled={isLoading}>
            {isLoading ? '刷新中' : '刷新'}
          </button>

          <label className={styles.tokenField}>
            <span>令牌</span>
            <input
              type="password"
              value={token}
              onChange={(event) => updateToken(event.target.value)}
              placeholder="Token"
              aria-label="图床管理令牌"
            />
          </label>

          <Link href="/upload/image" className={styles.primaryButton}>
            上传
          </Link>
        </div>
      </section>

      {error ? <p className={styles.errorText}>{error}</p> : null}

      <section
        className={styles.masonry}
        aria-live="polite"
      >
        {items.map((item, index) => {
          const fileName = getFileName(item.pathname);
          const fallbackRatio = frameRatios[index % frameRatios.length];
          const detected = imageSizes[item.url];
          const sourceRatio = detected ? detected.w / detected.h : parseAspectRatio(fallbackRatio);
          const tileRatio = formatAspectRatio(softCompressAspectRatio(sourceRatio));

          return (
            <article
              className={styles.imageTile}
              key={item.url}
              style={{ '--tile-ratio': tileRatio, '--rise-delay': `${Math.min(index % PAGE_SIZE, 12) * 42}ms` } as React.CSSProperties}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.imageAnchor}
                aria-label={`预览图片 ${fileName}`}
                onClick={(event) => {
                  event.preventDefault();
                  openPreview(item, fileName);
                }}
              >
                <PrefixedImage
                  src={item.url}
                  alt={fileName}
                  fill
                  preload={index < 2}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  className={styles.image}
                  onLoad={(e) => handleImageLoad(item.url, e)}
                />

                <span className={styles.sourceMark}>{item.source === 'cloudflare' ? 'R2' : 'Blob'}</span>
              </a>

              <div className={styles.tileOverlay}>
                <div className={styles.tileText}>
                  <p className={styles.tileMeta}>
                    {formatSize(item.size)} / {formatDate(item.uploadedAt)}
                  </p>
                </div>
                <div className={styles.tileActions}>
                  <a href={item.url} target="_blank" rel="noreferrer" className={styles.openMark}>
                    打开
                  </a>
                  <button type="button" onClick={() => void copyToClipboard(item.url)}>
                    {copiedUrl === item.url ? '已复制' : '复制'}
                  </button>
                  <a href={item.downloadUrl} target="_blank" rel="noreferrer">
                    下载
                  </a>
                  <button type="button" onClick={() => void deleteImage(item)} disabled={deletingUrl === item.url}>
                    {deletingUrl === item.url ? '删除中' : '删除'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {!isLoading && !error && items.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>图床为空</h2>
          <Link href="/upload/image">上传图片</Link>
        </section>
      ) : null}

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true">
        <span>{isLoading ? '加载中' : hasMore ? ' ' : '到底了'}</span>
      </div>

      {previewImage ? (
        <div
          className={`${styles.previewBackdrop} ${previewVisible ? styles.previewBackdropOpen : styles.previewBackdropClosing}`}
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              closePreview();
            }
          }}
        >
          <div
            className={`${styles.previewStage} ${previewVisible ? styles.previewStageOpen : styles.previewStageClosing}`}
            role="dialog"
            aria-modal="true"
            aria-label={`预览图片 ${previewImage.fileName}`}
            onClick={closePreview}
          >
            <PrefixedImage
              src={previewImage.url}
              alt={previewImage.fileName}
              fill
              preload
              sizes="(max-width: 960px) 100vw, 92vw"
              className={styles.previewImage}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
