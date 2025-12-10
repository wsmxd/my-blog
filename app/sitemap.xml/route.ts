// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 读取构建时生成的 sitemap.xml
    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const xml = await fs.readFile(filePath, 'utf8');
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Failed to load sitemap:', error);
    return new NextResponse('Sitemap not found', { status: 404 });
  }
}