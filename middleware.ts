// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  
  // 如果是 vercel 默认域名，重定向到正式域名
  if (host === 'mxd-blog.vercel.app') {
    return NextResponse.redirect(
      new URL(req.nextUrl.pathname, 'https://wsmxd.top')
    );
  }
}

export const config = {
  matcher: '/:path*',
};