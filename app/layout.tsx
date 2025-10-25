import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Modern Blog",
  description: "个人博客 — 基于 Next.js、Markdown 与 Giscus 评论",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-b from-white via-slate-50 to-white text-slate-800`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="container mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
