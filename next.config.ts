import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
