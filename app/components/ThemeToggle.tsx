'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'theme-preference';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 仅在客户端挂载后初始化主题状态
    const currentIsDark = document.documentElement.classList.contains('dark');
    setIsDark(currentIsDark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextIsDark = !isDark;
    const nextTheme = nextIsDark ? 'dark' : 'light';

    root.classList.add('theme-animating');
    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    window.setTimeout(() => root.classList.remove('theme-animating'), 380);
    setIsDark(nextIsDark);
  };

  // 未挂载时显示占位符以匹配服务端HTML
  if (!mounted) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="切换主题"
        className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-(--header-border) bg-(--surface-soft) text-foreground shadow-sm transition-all duration-300 hover:scale-105"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
        </svg>
        <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? '切换到亮色模式' : '切换到黑夜模式'}
      className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-(--header-border) bg-(--surface-soft) text-foreground shadow-sm transition-all duration-300 hover:scale-105"
    >
      {isDark ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
        </svg>
      )}
      <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
