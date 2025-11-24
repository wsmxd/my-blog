'use client'

import { useEffect } from 'react';

export default function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const key = `myblog:readed:${slug}`;
      const raw = localStorage.getItem(key);
      const ttl = 1000 * 60 * 60 * 24; // 24h
      const now = Date.now();
      if (raw) {
        const parsed = Number(raw || 0);
        if (now - parsed < ttl) return; // already counted recently
      }

      // fire-and-forget POST
      fetch(`/api/read/${encodeURIComponent(slug)}`, { method: 'POST', body: JSON.stringify({ count: 1 }), headers: { 'Content-Type': 'application/json' } })
        .then(() => {
          try { localStorage.setItem(key, String(now)); } catch (e) {}
        })
        .catch(() => {});
    } catch (err) {
      // ignore in non-browser env
    }
  }, [slug]);

  return null;
}
