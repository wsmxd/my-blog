import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: '**.public.blob.vercel-storage.com',
  },
  {
    protocol: 'https',
    hostname: '**.r2.cloudflarestorage.com',
  },
];

const customMediaDomain = process.env.R2_CUSTOM_DOMAIN;
if (customMediaDomain) {
  try {
    const parsed = new URL(customMediaDomain);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
    });
  } catch {
    // ignore invalid URL to avoid breaking build
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns,
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
