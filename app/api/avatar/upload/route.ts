import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  const stream = request.body;
  
  if (!stream) {
    return NextResponse.json(
      { error: 'Request body is null' },
      { status: 400 }
    );
  }

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required' },
      { status: 400 }
    );
  }

  try {
    const blob = await put(filename, stream, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
