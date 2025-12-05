export default function Footer() {
  return (
    <footer className="border-t border-slate-700 py-8 text-center text-sm text-slate-400 bg-slate-900/50 backdrop-blur-sm">
      <div className="space-y-2">
        <p className="font-medium">
          © {new Date().getFullYear()} My Modern Blog · Built with{" "}
          <span className="text-blue-400 font-semibold">Next.js</span>
        </p>
        <p className="text-xs text-slate-500">
          Powered by passion and coffee ☕
        </p>
      </div>
    </footer>
  );
}
