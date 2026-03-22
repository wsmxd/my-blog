export default function Footer() {
  return (
    <footer className="border-t border-(--header-border) py-8 text-center text-sm text-(--muted-foreground) bg-(--header-bg) backdrop-blur-sm">
      <div className="space-y-2">
        <p className="font-medium">
          © {new Date().getFullYear()} mxd的小窝 · Built with{' '}
          <span className="text-blue-500 font-semibold">Next.js</span>
        </p>
        <p className="text-xs text-(--muted-foreground)/85">
          Powered by passion and coffee ☕
        </p>
      </div>
    </footer>
  );
}
