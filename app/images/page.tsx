'use client';

import Link from 'next/link';
import PrefixedImage from '../components/PrefixedImage';
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

type ViewMode = 'vertical' | 'horizontal';

const PAGE_SIZE = 24;
const VERTICAL_GAP = 16;
const VERTICAL_MIN_CARD_WIDTH = 220;
const VERTICAL_OVERSCAN_ROWS = 3;
const HORIZONTAL_GAP = 16;
const HORIZONTAL_MIN_CARD_WIDTH = 270;
const HORIZONTAL_MAX_CARD_WIDTH = 360;
const HORIZONTAL_OVERSCAN_ITEMS = 2;
const VIRTUAL_VIEWPORT_HEIGHT = 'min(72vh, 760px)';

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

export default function ImagesPage() {
  const [items, setItems] = useState<GalleryBlob[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mode, setMode] = useState<ViewMode>('vertical');
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const cursorRef = useRef<CursorState | null>(null);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const [viewportState, setViewportState] = useState({
    width: 0,
    height: 0,
    scrollTop: 0,
    scrollLeft: 0,
  });

  const syncViewportState = useCallback(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }

    setViewportState({
      width: node.clientWidth,
      height: node.clientHeight,
      scrollTop: node.scrollTop,
      scrollLeft: node.scrollLeft,
    });
  }, []);

  const summaryText = useMemo(() => {
    if (error) {
      return error;
    }

    if (!isInitialized) {
      return '正在加载图床...';
    }

    if (!items.length) {
      return '还没有图片，先上传一张吧。';
    }

    return `${items.length} 张图片`;
  }, [error, isInitialized, items.length]);

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

      const response = await fetch(`/api/avatar/list?${params.toString()}`, { cache: 'no-store' });
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
  }, []);

  useEffect(() => {
    void loadPage(true);
  }, [loadPage]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node || !isInitialized) {
      return;
    }

    const maybeLoadMore = () => {
      if (isLoadingRef.current || !hasMoreRef.current) {
        return;
      }

      if (mode === 'horizontal') {
        if (node.scrollLeft + node.clientWidth >= node.scrollWidth - 320) {
          void loadPage(false);
        }
        return;
      }

      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 720) {
        void loadPage(false);
      }
    };

    const scheduleSync = () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        syncViewportState();
        maybeLoadMore();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleSync();
    });

    resizeObserver.observe(node);
    node.addEventListener('scroll', scheduleSync, { passive: true });
    scheduleSync();

    return () => {
      node.removeEventListener('scroll', scheduleSync);
      resizeObserver.disconnect();
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [isInitialized, loadPage, mode, syncViewportState]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }

    node.scrollTo({ top: 0, left: 0 });
    syncViewportState();
  }, [mode, syncViewportState]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node || isLoadingRef.current || !hasMoreRef.current) {
      return;
    }

    const needsMore = mode === 'horizontal'
      ? node.scrollWidth <= node.clientWidth + 12
      : node.scrollHeight <= node.clientHeight + 12;

    if (needsMore) {
      void loadPage(false);
    }
  }, [hasMore, isLoading, items.length, loadPage, mode, viewportState.height, viewportState.width]);

  const refresh = async () => {
    setItems([]);
    setHasMore(true);
    cursorRef.current = null;
    hasMoreRef.current = true;
    const node = viewportRef.current;
    if (node) {
      node.scrollTo({ top: 0, left: 0 });
    }
    await loadPage(true);
  };

  const verticalWindow = useMemo(() => {
    if (mode !== 'vertical') {
      return null;
    }

    const width = Math.max(viewportState.width, VERTICAL_MIN_CARD_WIDTH);
    const columns = Math.max(1, Math.floor((width + VERTICAL_GAP) / (VERTICAL_MIN_CARD_WIDTH + VERTICAL_GAP)));
    const cardWidth = Math.floor((width - VERTICAL_GAP * (columns - 1)) / columns);
    const estimatedCardHeight = Math.round(cardWidth * 1.25 + 92);
    const rowStride = estimatedCardHeight + VERTICAL_GAP;
    const totalRows = items.length > 0 ? Math.ceil(items.length / columns) : 0;
    const startRow = Math.max(0, Math.floor(viewportState.scrollTop / rowStride) - VERTICAL_OVERSCAN_ROWS);
    const endRow = Math.min(totalRows, Math.ceil((viewportState.scrollTop + viewportState.height) / rowStride) + VERTICAL_OVERSCAN_ROWS);
    const startIndex = Math.min(items.length, startRow * columns);
    const endIndex = Math.min(items.length, endRow * columns);

    return {
      columns,
      cardWidth,
      startIndex,
      endIndex,
      topSpacer: startRow * rowStride,
      bottomSpacer: Math.max(0, totalRows * rowStride - endRow * rowStride),
    };
  }, [items.length, mode, viewportState.height, viewportState.scrollTop, viewportState.width]);

  const horizontalWindow = useMemo(() => {
    if (mode !== 'horizontal') {
      return null;
    }

    const width = Math.max(viewportState.width, HORIZONTAL_MIN_CARD_WIDTH);
    const cardWidth = Math.min(Math.max(Math.floor(width * 0.34), HORIZONTAL_MIN_CARD_WIDTH), HORIZONTAL_MAX_CARD_WIDTH);
    const stride = cardWidth + HORIZONTAL_GAP;
    const startIndex = Math.max(0, Math.floor(viewportState.scrollLeft / stride) - HORIZONTAL_OVERSCAN_ITEMS);
    const endIndex = Math.min(items.length, Math.ceil((viewportState.scrollLeft + viewportState.width) / stride) + HORIZONTAL_OVERSCAN_ITEMS);

    return {
      cardWidth,
      startIndex,
      endIndex,
      leftSpacer: startIndex * stride,
      rightSpacer: Math.max(0, (items.length - endIndex) * stride),
    };
  }, [items.length, mode, viewportState.scrollLeft, viewportState.width]);

  const visibleItems = useMemo(() => {
    if (mode === 'vertical' && verticalWindow) {
      return items.slice(verticalWindow.startIndex, verticalWindow.endIndex);
    }

    if (mode === 'horizontal' && horizontalWindow) {
      return items.slice(horizontalWindow.startIndex, horizontalWindow.endIndex);
    }

    return [] as GalleryBlob[];
  }, [horizontalWindow, items, mode, verticalWindow]);

  return (
    <main style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />

      <section style={styles.shell}>
        <header style={styles.hero}>
          <div style={styles.heroCopy}>
            <p style={styles.kicker}>Image Bed</p>
            <h1 style={styles.title}>图床</h1>
            <p style={styles.subtitle}>
              纵向或横向无限滚动浏览，统一聚合 Cloudflare R2 与 Vercel Blob。
            </p>
          </div>

          <div style={styles.heroActions}>
            <Link href="/upload" style={styles.primaryLink}>
              上传图片
            </Link>
            <button type="button" style={styles.secondaryButton} onClick={() => setMode((current) => (current === 'vertical' ? 'horizontal' : 'vertical'))}>
              {mode === 'vertical' ? '切换横向流' : '切换纵向流'}
            </button>
            <button type="button" style={styles.secondaryButton} onClick={() => void refresh()} disabled={isLoading}>
              {isLoading ? '刷新中...' : '刷新图床'}
            </button>
          </div>
        </header>

        <div style={styles.toolbar}>
          <div>
            <p style={styles.toolbarLabel}>状态</p>
            <p style={styles.toolbarValue}>{summaryText}</p>
          </div>

          <div style={styles.modePillRow}>
            <span style={{ ...styles.modePill, ...(mode === 'vertical' ? styles.modePillActive : {}) }}>纵向</span>
            <span style={{ ...styles.modePill, ...(mode === 'horizontal' ? styles.modePillActive : {}) }}>横向</span>
          </div>
        </div>

        <div ref={viewportRef} style={mode === 'vertical' ? styles.verticalViewport : styles.horizontalViewport}>
          {mode === 'vertical' && verticalWindow ? (
            <div style={{ ...styles.verticalGrid, gridTemplateColumns: `repeat(${verticalWindow.columns}, minmax(0, 1fr))` }}>
              <div style={{ gridColumn: '1 / -1', height: verticalWindow.topSpacer }} aria-hidden="true" />

              {visibleItems.map((item) => (
                <article key={item.url} style={styles.verticalCard}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={styles.imageLink}>
                    <div style={styles.verticalImageFrame}>
                      <PrefixedImage
                        src={item.url}
                        alt={item.pathname}
                        fill
                        sizes={`(max-width: 768px) 100vw, ${verticalWindow.cardWidth}px`}
                        style={styles.coverImage}
                      />
                      <div style={styles.imageOverlay}>
                        <span style={item.source === 'cloudflare' ? styles.badgeCloudflare : styles.badgeVercel}>
                          {item.source === 'cloudflare' ? 'Cloudflare R2' : 'Vercel Blob'}
                        </span>
                      </div>
                    </div>
                  </a>

                  <div style={styles.cardBody}>
                    <div style={styles.cardTopRow}>
                      <p style={styles.cardTitle}>{item.pathname.split('/').pop()}</p>
                      <span style={styles.cardMeta}>{formatSize(item.size)}</span>
                    </div>
                    <p style={styles.cardPath}>{item.pathname}</p>
                    <p style={styles.cardDate}>{new Intl.DateTimeFormat('zh-CN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(item.uploadedAt))}</p>
                  </div>
                </article>
              ))}

              <div style={{ gridColumn: '1 / -1', height: verticalWindow.bottomSpacer }} aria-hidden="true" />
            </div>
          ) : null}

          {mode === 'horizontal' && horizontalWindow ? (
            <div style={{ ...styles.horizontalTrack, display: 'flex', width: 'max-content' }}>
              <div style={{ flex: `0 0 ${horizontalWindow.leftSpacer}px`, minHeight: 1 }} aria-hidden="true" />

              {visibleItems.map((item) => (
                <article key={item.url} style={{ ...styles.horizontalCard, width: horizontalWindow.cardWidth, flex: '0 0 auto' }}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={styles.imageLink}>
                    <div style={styles.horizontalImageFrame}>
                      <PrefixedImage
                        src={item.url}
                        alt={item.pathname}
                        fill
                        sizes={`(max-width: 768px) 86vw, ${horizontalWindow.cardWidth}px`}
                        style={styles.coverImage}
                      />
                      <div style={styles.imageOverlay}>
                        <span style={item.source === 'cloudflare' ? styles.badgeCloudflare : styles.badgeVercel}>
                          {item.source === 'cloudflare' ? 'Cloudflare R2' : 'Vercel Blob'}
                        </span>
                      </div>
                    </div>
                  </a>

                  <div style={styles.cardBody}>
                    <div style={styles.cardTopRow}>
                      <p style={styles.cardTitle}>{item.pathname.split('/').pop()}</p>
                      <span style={styles.cardMeta}>{formatSize(item.size)}</span>
                    </div>
                    <p style={styles.cardPath}>{item.pathname}</p>
                    <p style={styles.cardDate}>{new Intl.DateTimeFormat('zh-CN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(item.uploadedAt))}</p>
                  </div>
                </article>
              ))}

              <div style={{ flex: `0 0 ${horizontalWindow.rightSpacer}px`, minHeight: 1 }} aria-hidden="true" />
            </div>
          ) : null}
        </div>

        <div style={styles.footerStatus}>
          {isLoading ? '加载更多中...' : hasMore ? '继续滚动可自动加载更多图片' : '已经到底了'}
        </div>

        {error ? <p style={styles.errorText}>{error}</p> : null}

        {!isLoading && !error && items.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>图床为空</p>
            <p style={styles.emptyText}>上传图片后，这里会自动出现可虚拟滚动的图床列表。</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at 12% 12%, rgba(56,189,248,0.18), transparent 28%), radial-gradient(circle at 88% 16%, rgba(168,85,247,0.16), transparent 26%), linear-gradient(180deg, #050816 0%, #0b1120 42%, #050816 100%)',
    color: '#e2e8f0',
  },
  glowA: {
    position: 'absolute',
    inset: '12% auto auto -12%',
    width: 320,
    height: 320,
    borderRadius: '999px',
    background: 'rgba(56,189,248,0.14)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
  glowB: {
    position: 'absolute',
    inset: 'auto -8% 8% auto',
    width: 360,
    height: 360,
    borderRadius: '999px',
    background: 'rgba(168,85,247,0.12)',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  shell: {
    position: 'relative',
    maxWidth: 1440,
    margin: '0 auto',
    padding: '32px 16px 40px',
  },
  hero: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  heroCopy: {
    maxWidth: 760,
  },
  kicker: {
    margin: '0 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.28em',
    fontSize: 11,
    color: '#93c5fd',
    fontWeight: 800,
  },
  title: {
    margin: '0 0 10px',
    fontSize: 'clamp(40px, 7vw, 72px)',
    lineHeight: 0.95,
    letterSpacing: '-0.05em',
    color: '#f8fafc',
  },
  subtitle: {
    margin: 0,
    maxWidth: 620,
    fontSize: 15,
    lineHeight: 1.8,
    color: '#94a3b8',
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
    padding: '11px 16px',
    borderRadius: 999,
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #7dd3fc 0%, #a5b4fc 48%, #c4b5fd 100%)',
    boxShadow: '0 18px 40px -18px rgba(125, 211, 252, 0.75)',
  },
  secondaryButton: {
    border: '1px solid rgba(148,163,184,0.22)',
    background: 'rgba(15,23,42,0.5)',
    color: '#e2e8f0',
    borderRadius: 999,
    padding: '11px 16px',
    fontWeight: 700,
    cursor: 'pointer',
    backdropFilter: 'blur(14px)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 18,
    padding: '16px 18px',
    borderRadius: 24,
    border: '1px solid rgba(148,163,184,0.16)',
    background: 'rgba(15,23,42,0.55)',
    backdropFilter: 'blur(18px)',
  },
  toolbarLabel: {
    margin: '0 0 4px',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.22em',
    color: '#94a3b8',
    fontWeight: 800,
  },
  toolbarValue: {
    margin: 0,
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: 700,
  },
  modePillRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  modePill: {
    padding: '7px 12px',
    borderRadius: 999,
    fontSize: 12,
    color: '#94a3b8',
    background: 'rgba(15,23,42,0.45)',
    border: '1px solid rgba(148,163,184,0.16)',
  },
  modePillActive: {
    color: '#dbeafe',
    background: 'rgba(59,130,246,0.16)',
    border: '1px solid rgba(96,165,250,0.22)',
  },
  verticalViewport: {
    height: VIRTUAL_VIEWPORT_HEIGHT,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: 8,
    scrollbarWidth: 'thin',
  },
  verticalGrid: {
    display: 'grid',
    gap: 16,
  },
  horizontalViewport: {
    height: VIRTUAL_VIEWPORT_HEIGHT,
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: 12,
    scrollSnapType: 'x proximity',
    scrollbarWidth: 'thin',
    paddingRight: 8,
  },
  horizontalTrack: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'clamp(270px, 34vw, 360px)',
    gap: 16,
    alignItems: 'stretch',
  },
  verticalCard: {
    overflow: 'hidden',
    borderRadius: 24,
    border: '1px solid rgba(148,163,184,0.16)',
    background: 'rgba(15,23,42,0.82)',
    boxShadow: '0 16px 38px -18px rgba(15,23,42,0.7)',
  },
  horizontalCard: {
    overflow: 'hidden',
    borderRadius: 24,
    border: '1px solid rgba(148,163,184,0.16)',
    background: 'rgba(15,23,42,0.82)',
    boxShadow: '0 16px 38px -18px rgba(15,23,42,0.7)',
    scrollSnapAlign: 'start',
  },
  imageLink: {
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
  },
  verticalImageFrame: {
    position: 'relative',
    aspectRatio: '4 / 5',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(168,85,247,0.1))',
  },
  horizontalImageFrame: {
    position: 'relative',
    aspectRatio: '4 / 5',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(168,85,247,0.1))',
  },
  coverImage: {
    objectFit: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
  },
  badgeCloudflare: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(59,130,246,0.16)',
    color: '#dbeafe',
    fontSize: 11,
    fontWeight: 800,
    border: '1px solid rgba(96,165,250,0.2)',
    backdropFilter: 'blur(12px)',
  },
  badgeVercel: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(168,85,247,0.16)',
    color: '#f3e8ff',
    fontSize: 11,
    fontWeight: 800,
    border: '1px solid rgba(196,181,253,0.2)',
    backdropFilter: 'blur(12px)',
  },
  cardBody: {
    padding: 14,
    display: 'grid',
    gap: 6,
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: '#f8fafc',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    flexShrink: 0,
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: 700,
  },
  cardPath: {
    margin: 0,
    fontSize: 12,
    color: '#94a3b8',
    wordBreak: 'break-all',
  },
  cardDate: {
    margin: 0,
    fontSize: 12,
    color: '#cbd5e1',
  },
  sentinel: {
    minHeight: 84,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    border: '1px dashed rgba(148,163,184,0.24)',
    color: '#94a3b8',
    fontSize: 13,
    background: 'rgba(15,23,42,0.45)',
  },
  footerStatus: {
    marginTop: 16,
    padding: '12px 16px',
    borderRadius: 18,
    border: '1px solid rgba(148,163,184,0.14)',
    background: 'rgba(15,23,42,0.48)',
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  errorText: {
    margin: '16px 0 0',
    color: '#fca5a5',
    fontSize: 13,
  },
};