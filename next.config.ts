import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development', // 开发环境禁用优化
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'mxd-blog.vercel.app' }],
        destination: 'https://wsmxd.top/:path*',
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
