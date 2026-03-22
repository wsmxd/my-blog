'use client';

const STORAGE_KEY = 'theme-preference';

export default function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';

    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="切换主题"
      className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-(--header-border) bg-(--surface-soft) text-foreground shadow-sm transition-all duration-300 hover:scale-105"
    >
      <span className="hidden dark:block">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
        </svg>
      </span>
      <span className="block dark:hidden">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
        </svg>
      </span>
      <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}
