'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blobs, setBlobs] = useState<PutBlobResult[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [token, setToken] = useState<string>('');

  const helpText = useMemo(
    () =>
      error
        ? error
        : 'JPG / PNG / WEBP · 最大 10MB（浏览器限制）',
    [error],
  );

  // 组件加载时从 localStorage 读取保存的 token
  useEffect(() => {
    const savedToken = localStorage.getItem('uploadToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleFileChange = () => {
    const fileList = inputFileRef.current?.files;
    if (!fileList || fileList.length === 0) {
      setFileNames([]);
      return;
    }

    if (fileList.length > 10) {
      setError('一次最多选择 10 张图片');
      setFileNames([]);
      return;
    }

    setError(null);
    setFileNames(Array.from(fileList).map((f) => f.name));
  };

  const resetState = () => {
    setError(null);
    setBlobs([]);
  };
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>Avatar Uploader</p>
            <h1 style={styles.title}>上传图片</h1>
            <p style={styles.subtitle}>支持 JPG / PNG / WEBP，上传后会生成可公开访问的链接。</p>
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
                    headers: {
                      // 使用用户输入的 token
                      ...(token.trim()
                        ? { Authorization: `Bearer ${token.trim()}` }
                        : {}),
                    },
                  },
                );

                if (!response.ok) {
                  throw new Error(`上传失败：${file.name}`);
                }

                return (await response.json()) as PutBlobResult;
              });

              const results = await Promise.all(uploads);
              setBlobs(results);
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