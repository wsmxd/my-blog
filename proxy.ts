import { NextResponse, type NextRequest } from 'next/server';

// Simple token-based guard for upload API
const UPLOAD_TOKEN = process.env.UPLOAD_API_TOKEN;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect the upload API route
  if (!pathname.startsWith('/api/avatar/upload')) {
    return NextResponse.next();
  }

  // If token not configured, deny by default
  if (!UPLOAD_TOKEN) {
    return NextResponse.json({ error: 'Upload is disabled' }, { status: 403 });
  }

  const auth = req.headers.get('authorization') || '';
  // Expect format: Authorization: Bearer <token>
  const token = auth.toLowerCase().startsWith('bearer ')
    ? auth.slice(7).trim()
    : '';

  if (token !== UPLOAD_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.next();
}

// Limit proxy to the upload API only
export const config = {
  matcher: ['/api/avatar/upload'],
};
