export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} My Modern Blog · Built with Next.js
    </footer>
  );
}
