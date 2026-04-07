'use client';

import { useLayoutEffect } from 'react';

export default function ThemeScript() {
  useLayoutEffect(() => {
    const storageKey = 'theme-preference';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem(storageKey);
    const theme = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  return null;
}
