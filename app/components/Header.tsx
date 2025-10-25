import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white/60 backdrop-blur sticky top-0 z-30 border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          My Modern Blog
        </Link>
        <nav className="space-x-4 text-sm">
          <Link href="/blog" className="text-slate-600 hover:text-slate-900">
            博客
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-900"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
