'use client';

import { useMemo, useRef, useState } from 'react';

type UploadResult = {
  key: string;
  url: string;
  contentType: string;
  size: number;
};

const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export default function VideoUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const snippet = useMemo(() => {
    if (!result) return '';
    return `---\ntitle: 示例视频\ndate: ${new Date().toISOString().slice(0, 10)}\ndescription: 请填写视频简介\ntags:\n  - demo\ncover: /images/default-cover.svg\nduration: 00:00\nvideoUrl: ${result.url}\n---\n\n这里是视频说明内容。`;
  }, [result]);

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>上传视频到 Cloudflare R2</h1>
        <p style={styles.subtitle}>支持 MP4 / WEBM / OGG / MOV，上传后会返回可直接写入 videos/*.md 的 URL。</p>

        <form
          style={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setResult(null);

            const file = inputRef.current?.files?.[0];
            if (!file) {
              setError('请先选择一个视频文件');
              return;
            }

            if (!allowedTypes.includes(file.type)) {
              setError('文件类型不支持，仅支持 mp4/webm/ogg/mov');
              return;
            }

            setIsUploading(true);
            try {
              const response = await fetch(`/api/videos/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
                headers: {
                  ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
                  'Content-Type': file.type,
                },
              });

              const data = (await response.json()) as UploadResult & { error?: string };
              if (!response.ok) {
                throw new Error(data?.error || '上传失败');
              }

              setResult(data as UploadResult);
            } catch (err) {
              setError(err instanceof Error ? err.message : '上传失败');
            } finally {
              setIsUploading(false);
            }
          }}
        >
          <label style={styles.inputLabel}>
            <span style={styles.labelText}>管理员上传令牌（可选）</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="若服务端配置 VIDEO_UPLOAD_TOKEN 则必填"
              style={styles.input}
            />
          </label>

          <label style={styles.inputLabel}>
            <span style={styles.labelText}>视频文件</span>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              style={styles.input}
              required
            />
          </label>

          <button style={styles.button} type="submit" disabled={isUploading}>
            {isUploading ? '上传中...' : '开始上传'}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>

        {result && (
          <div style={styles.resultBox}>
            <p style={styles.resultTitle}>上传成功：</p>
            <a href={result.url} target="_blank" rel="noreferrer" style={styles.link}>{result.url}</a>

            <p style={{ ...styles.resultTitle, marginTop: 12 }}>Frontmatter 示例：</p>
            <pre style={styles.pre}>{snippet}</pre>
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
    background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.15), transparent 30%), #0b1221',
  },
  card: {
    width: '100%',
    maxWidth: 820,
    background: 'linear-gradient(145deg, #0f172a 0%, #0b1221 100%)',
    borderRadius: 20,
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    padding: '32px 32px 28px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 26,
    margin: '0 0 8px',
    color: '#e5e7eb',
  },
  subtitle: {
    margin: '0 0 16px',
    color: '#94a3b8',
    fontSize: 14,
  },
  form: {
    display: 'grid',
    gap: 12,
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
  input: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.35)',
    background: 'rgba(148,163,184,0.05)',
    color: '#e5e7eb',
    fontSize: 14,
    outline: 'none',
  },
  button: {
    border: 'none',
    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
    color: '#f8fafc',
    fontWeight: 600,
    padding: '10px 18px',
    borderRadius: 10,
    cursor: 'pointer',
    minWidth: 120,
  },
  error: {
    margin: 0,
    color: '#fca5a5',
    fontSize: 13,
  },
  resultBox: {
    marginTop: 16,
    padding: '12px 14px',
    borderRadius: 12,
    background: 'rgba(148,163,184,0.08)',
    border: '1px solid rgba(148,163,184,0.25)',
  },
  resultTitle: {
    margin: '0 0 6px',
    fontSize: 13,
    color: '#cbd5e1',
  },
  link: {
    color: '#93c5fd',
    textDecoration: 'none',
    wordBreak: 'break-all',
  },
  pre: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 12,
    color: '#e2e8f0',
    background: 'rgba(2,6,23,0.6)',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 8,
    padding: 10,
  },
};
