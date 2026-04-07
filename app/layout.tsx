import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ThemeScript from "./components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "mxd的小窝",
    template: "%s | mxd的小窝",
  },
  description: "mxd 的个人博客，记录技术、思考与生活。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
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
