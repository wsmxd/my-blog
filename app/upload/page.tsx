import Link from 'next/link';

type UploadRouteCard = {
  href: string;
  title: string;
  description: string;
  accent: string;
};

const uploadRoutes: UploadRouteCard[] = [
  {
    href: '/upload/image',
    title: '图床图片上传',
    description: '上传到图片库，适合封面、截图和公共图片资源。',
    accent: 'from-sky-500/30 via-cyan-400/15 to-transparent',
  },
  {
    href: '/upload/post',
    title: '文章配图入口',
    description: '给文章内容里的内嵌图片预留独立路由，避免混进图床。',
    accent: 'from-fuchsia-500/30 via-pink-400/15 to-transparent',
  },
  {
    href: '/upload/video',
    title: '视频上传',
    description: '保持与图片分离的视频上传入口。',
    accent: 'from-emerald-500/30 via-teal-400/15 to-transparent',
  },
];

export default function UploadHubPage() {
  return (
    <main
      className="min-h-screen px-4 py-12 sm:px-6 lg:px-8"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, var(--hero-glow-a) 0%, transparent 32%), radial-gradient(circle at 80% 0%, var(--hero-glow-b) 0%, transparent 28%)',
      }}
    >
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[32px] border border-[color:var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-8 dark:shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--filter-active-from)]">Upload Routes</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">把不同类型的上传分开</h1>
          <p className="text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
            这里是统一入口，不同内容会进入不同路由。图床图片、文章配图和视频各自独立，避免文章内嵌图片和图床资源混在同一个页面里。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {uploadRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-[var(--surface-soft)] p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-[color:var(--filter-active-shadow)]"
            >
              <span className={`absolute inset-0 bg-gradient-to-br ${route.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />
              <span className="absolute inset-px rounded-[22px] bg-[var(--surface-strong)]" />
              <div className="relative z-10 flex h-full flex-col gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Route</p>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">{route.title}</h2>
                </div>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">{route.description}</p>
                <div className="mt-auto pt-4 text-sm font-semibold text-[var(--filter-active-from)] transition-colors group-hover:text-[var(--filter-active-to)]">
                  打开 {route.href}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <Link href="/images" className="font-semibold text-[var(--filter-active-from)] transition-colors hover:text-[var(--filter-active-to)]">
            去图床管理
          </Link>
          <span className="hidden h-4 w-px bg-[var(--card-border)] sm:block" />
          <span>如果你只是要上传封面或公共图片，优先进入图床图片上传。</span>
        </div>
      </section>
    </main>
  );
}