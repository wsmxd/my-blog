'use client';

import type { PutBlobResult } from '@vercel/blob';
import Image from 'next/image';
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

const MAX_FILES = 10;

function buildAuthHeaders(tokenValue: string): HeadersInit {
  const value = tokenValue.trim();
  return value ? { Authorization: `Bearer ${value}` } : {};
}

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blobs, setBlobs] = useState<PutBlobResult[]>([]);
  const [gallery, setGallery] = useState<GalleryBlob[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const initialTokenRef = useRef<string | null>(null);
  const hasBootstrappedGalleryRef = useRef(false);

  const helpText = useMemo(
    () =>
      error
        ? error
        : 'JPG / PNG / WEBP / GIF / AVIF · 最大 10MB（浏览器限制）',
    [error],
  );

  const galleryTitle = useMemo(() => {
    if (galleryError) {
      return galleryError;
    }

    if (isGalleryLoading) {
      return '正在加载图床...';
    }

    if (!gallery.length) {
      return '图床里还没有图片，先上传一张吧。';
    }

    return `${gallery.length} 张图片已入库`;
  }, [gallery.length, galleryError, isGalleryLoading]);

  const loadGallery = useCallback(async (overrideToken?: string) => {
    const activeToken = (overrideToken ?? token).trim();

    setIsGalleryLoading(true);
    setGalleryError(null);

    try {
      const response = await fetch('/api/avatar/list?limit=60', {
        headers: buildAuthHeaders(activeToken),
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || '加载图床失败');
      }

      const payload = (await response.json()) as { blobs?: GalleryBlob[] };
      setGallery(payload.blobs || []);
    } catch (err) {
      setGallery([]);
      setGalleryError(err instanceof Error ? err.message : '加载图床失败');
    } finally {
      setIsGalleryLoading(false);
    }
  }, [token]);

  // 组件加载时从 localStorage 读取保存的 token
  useEffect(() => {
    if (hasBootstrappedGalleryRef.current) {
      return;
    }

    hasBootstrappedGalleryRef.current = true;
    const savedToken = localStorage.getItem('uploadToken');
    initialTokenRef.current = savedToken;
    if (savedToken) {
      setToken(savedToken);
    }
    void loadGallery(savedToken || undefined);
  }, [loadGallery]);

  useEffect(() => {
    if (initialTokenRef.current === token) {
      return;
    }

    void loadGallery(token || undefined);
  }, [loadGallery, token]);

  const handleFileChange = () => {
    const fileList = inputFileRef.current?.files;
    if (!fileList || fileList.length === 0) {
      setFileNames([]);
      return;
    }

    if (fileList.length > MAX_FILES) {
      setError('一次最多选择 10 张图片');
      setFileNames([]);
      return;
    }

    setError(null);
    setFileNames(Array.from(fileList).map((f) => f.name));
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    window.setTimeout(() => {
      setCopiedUrl((current) => (current === url ? null : current));
    }, 2000);
  };

  const deleteImage = useCallback(async (item: GalleryBlob) => {
    if (!token.trim()) {
      setError('请输入访问令牌');
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

      await loadGallery();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingUrl(null);
    }
  }, [loadGallery, token]);

  const resetState = () => {
    setError(null);
    setBlobs([]);
  };
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>Image Bed</p>
            <h1 style={styles.title}>上传图片</h1>
            <p style={styles.subtitle}>支持 JPG / PNG / WEBP / GIF / AVIF，上传后会自动出现在下方图床中。</p>
          </div>
        </header>

        <form
          style={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            resetState();

            const fileList = inputFileRef.current?.files;

            if (!fileList || fileList.length === 0) {
              setError('请先选择图片');
              return;
            }

            if (fileList.length > 10) {
              setError('每次最多上传 10 张图片');
              return;
            }

            if (!token.trim()) {
              setError('请输入访问令牌');
              return;
            }

            setIsUploading(true);
            try {
              // 保存 token 到 localStorage
              if (token.trim()) {
                localStorage.setItem('uploadToken', token.trim());
              }

              const uploads = Array.from(fileList).map(async (file) => {
                const response = await fetch(
                  `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
                  {
                    method: 'POST',
                    body: file,
                    headers: buildAuthHeaders(token),
                  },
                );

                if (!response.ok) {
                  throw new Error(`上传失败：${file.name}`);
                }

                return (await response.json()) as PutBlobResult;
              });

              const results = await Promise.all(uploads);
              setBlobs(results);
              await loadGallery();
            } catch (err) {
              setError(err instanceof Error ? err.message : '上传出现问题');
            } finally {
              setIsUploading(false);
            }
          }}
        >
          <label style={styles.inputLabel}>
            <span style={styles.labelText}>访问令牌 (Token)</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="请输入访问令牌"
              style={styles.tokenInput}
              required
            />
          </label>

          <label style={styles.dropzone}>
            <input
              name="file"
              ref={inputFileRef}
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              required
              style={styles.hiddenInput}
            />
            <div style={styles.dropzoneInner}>
              <span style={styles.dropzoneIcon}>⬆</span>
              <p style={styles.dropzoneText}>点击选择图片，或将文件拖入此处（最多 10 张）</p>
              {fileNames.length > 0 && (
                <p style={styles.fileName}>
                  {fileNames.length} 个文件：{fileNames.join(', ')}
                </p>
              )}
            </div>
          </label>

          <div style={styles.actions}>
            <small style={{ ...styles.help, color: error ? '#fca5a5' : '#9ca3af' }}>{helpText}</small>
            <button style={styles.button} type="submit" disabled={isUploading}>
              {isUploading ? '上传中...' : '开始上传'}
            </button>
          </div>
        </form>

        {blobs.length > 0 && (
          <div style={styles.resultBox}>
            <p style={styles.resultLabel}>上传成功，访问链接：</p>
            <ul style={styles.resultList}>
              {blobs.map((item) => (
                <li key={item.url} style={styles.resultItem}>
                  <a style={styles.resultLink} href={item.url} target="_blank" rel="noreferrer">
                    {item.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section style={styles.gallerySection}>
          <div style={styles.galleryHeader}>
            <div>
              <p style={styles.galleryKicker}>图库</p>
              <h2 style={styles.galleryTitle}>{galleryTitle}</h2>
            </div>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => void loadGallery()}
              disabled={isGalleryLoading}
            >
              {isGalleryLoading ? '刷新中...' : '刷新图床'}
            </button>
          </div>

          <div style={styles.galleryMeta}>
            <span>存储在 image-bed/ 前缀下</span>
            <span>支持直接复制公开链接</span>
          </div>

          {gallery.length > 0 ? (
            <div style={styles.galleryGrid}>
              {gallery.map((item) => (
                <article key={item.url} style={styles.galleryCard}>
                  <a href={item.url} target="_blank" rel="noreferrer" style={styles.previewLink}>
                    <div style={styles.previewFrame}>
                      <Image
                        src={item.url}
                        alt={item.pathname}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={styles.previewImage}
                      />
                    </div>
                  </a>

                  <div style={styles.cardBody}>
                    <div style={styles.cardTopRow}>
                      <span style={styles.sourceBadge}>{item.source === 'cloudflare' ? 'Cloudflare R2' : 'Vercel Blob'}</span>
                    </div>
                    <p style={styles.filePath}>{item.pathname}</p>
                    <p style={styles.fileMeta}>
                      {new Intl.DateTimeFormat('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.uploadedAt))}
                      {' · '}
                      {(item.size / 1024).toFixed(1)} KB
                    </p>

                    <div style={styles.cardActions}>
                      <button
                        type="button"
                        style={styles.linkButton}
                        onClick={() => void copyToClipboard(item.url)}
                      >
                        {copiedUrl === item.url ? '已复制' : '复制链接'}
                      </button>
                      <a href={item.downloadUrl} target="_blank" rel="noreferrer" style={styles.downloadButton}>
                        下载
                      </a>
                      <button
                        type="button"
                        style={styles.deleteButton}
                        onClick={() => void deleteImage(item)}
                        disabled={deletingUrl === item.url}
                      >
                        {deletingUrl === item.url ? '删除中...' : '删除'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            !isGalleryLoading && (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>图床为空</p>
                <p style={styles.emptyText}>上传图片后，这里会自动出现缩略图、链接和下载入口。</p>
              </div>
            )
          )}
        </section>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    padding: '48px 16px',
    background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(236,72,153,0.12), transparent 30%), #0b1221',
  },
  card: {
    width: '100%',
    maxWidth: 720,
    background: 'linear-gradient(145deg, #0f172a 0%, #0b1221 100%)',
    borderRadius: 20,
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    padding: '32px 32px 28px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  header: {
    marginBottom: 24,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: 700,
    color: '#93c5fd',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    margin: '0 0 6px',
    color: '#e5e7eb',
  },
  subtitle: {
    margin: 0,
    color: '#94a3b8',
    fontSize: 14,
  },
  form: {
    display: 'grid',
    gap: 16,
  },
  dropzone: {
    border: '2px dashed rgba(148,163,184,0.35)',
    borderRadius: 16,
    padding: 16,
    background: 'rgba(148,163,184,0.05)',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease',
    display: 'block',
  },
  dropzoneInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#cbd5e1',
    padding: '24px 12px',
  },
  dropzoneIcon: {
    fontSize: 28,
  },
  dropzoneText: {
    margin: 0,
    fontSize: 14,
  },
  fileName: {
    margin: 0,
    fontSize: 13,
    color: '#a5b4fc',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  help: {
    fontSize: 12,
    margin: 0,
  },
  button: {
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
    color: '#f8fafc',
    fontWeight: 600,
    padding: '10px 18px',
    borderRadius: 10,
    cursor: 'pointer',
    minWidth: 120,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  resultBox: {
    marginTop: 8,
    padding: '12px 14px',
    borderRadius: 12,
    background: 'rgba(148,163,184,0.08)',
    border: '1px solid rgba(148,163,184,0.25)',
  },
  resultLabel: {
    margin: '0 0 4px',
    fontSize: 13,
    color: '#cbd5e1',
  },
  resultLink: {
    wordBreak: 'break-all',
    color: '#93c5fd',
    fontWeight: 600,
    textDecoration: 'none',
  },
  resultList: {
    margin: 0,
    paddingLeft: 18,
    display: 'grid',
    gap: 6,
  },
  resultItem: {
    color: '#e5e7eb',
  },
  gallerySection: {
    marginTop: 24,
    paddingTop: 24,
    borderTop: '1px solid rgba(148,163,184,0.16)',
  },
  galleryHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  galleryKicker: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: 700,
    color: '#93c5fd',
    margin: '0 0 6px',
  },
  galleryTitle: {
    margin: 0,
    fontSize: 18,
    color: '#f8fafc',
  },
  galleryMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 18,
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  galleryCard: {
    overflow: 'hidden',
    borderRadius: 16,
    background: 'rgba(15,23,42,0.92)',
    border: '1px solid rgba(148,163,184,0.16)',
    boxShadow: '0 18px 40px rgba(0,0,0,0.2)',
  },
  previewLink: {
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
  },
  previewFrame: {
    position: 'relative',
    aspectRatio: '4 / 3',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(168,85,247,0.15))',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  cardBody: {
    padding: 14,
    display: 'grid',
    gap: 10,
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.2,
    color: '#cbd5e1',
    background: 'rgba(148,163,184,0.12)',
    border: '1px solid rgba(148,163,184,0.18)',
  },
  filePath: {
    margin: 0,
    fontSize: 13,
    color: '#e2e8f0',
    wordBreak: 'break-all',
  },
  fileMeta: {
    margin: 0,
    fontSize: 12,
    color: '#94a3b8',
  },
  cardActions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkButton: {
    border: '1px solid rgba(96,165,250,0.35)',
    background: 'rgba(59,130,246,0.12)',
    color: '#dbeafe',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
  },
  downloadButton: {
    border: '1px solid rgba(148,163,184,0.22)',
    background: 'rgba(148,163,184,0.06)',
    color: '#cbd5e1',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 10,
    textDecoration: 'none',
  },
  deleteButton: {
    border: '1px solid rgba(248,113,113,0.34)',
    background: 'rgba(248,113,113,0.12)',
    color: '#fecaca',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(148,163,184,0.08)',
    color: '#e2e8f0',
    fontWeight: 600,
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
  },
  emptyState: {
    padding: '24px 18px',
    borderRadius: 16,
    border: '1px dashed rgba(148,163,184,0.28)',
    background: 'rgba(148,163,184,0.04)',
  },
  emptyTitle: {
    margin: '0 0 6px',
    color: '#e2e8f0',
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    color: '#94a3b8',
    fontSize: 13,
  },
  inputLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#cbd5e1',
    letterSpacing: 0.3,
  },
  tokenInput: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.35)',
    background: 'rgba(148,163,184,0.05)',
    color: '#e5e7eb',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease, background 0.2s ease',
  },
};