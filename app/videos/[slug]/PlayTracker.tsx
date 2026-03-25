'use client';

import { useEffect } from 'react';

export default function PlayTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const key = `myblog:played:${slug}`;
      const raw = localStorage.getItem(key);
      const ttl = 1000 * 60 * 60 * 12; // 12h
      const now = Date.now();

      if (raw) {
        const last = Number(raw || 0);
        if (now - last < ttl) return;
      }

      fetch(`/api/video-play/${encodeURIComponent(slug)}`, {
        method: 'POST',
        body: JSON.stringify({ count: 1 }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(() => {
          try {
            localStorage.setItem(key, String(now));
          } catch {
            // ignore storage failure
          }
        })
        .catch(() => {});
    } catch {
      // ignore in non-browser env
    }
  }, [slug]);

  return null;
}
