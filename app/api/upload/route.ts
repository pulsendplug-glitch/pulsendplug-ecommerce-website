import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthorized } from '@/lib/adminAuth';

// Uploads a product photo to Vercel Blob storage and returns its public URL.
// Requires the BLOB_READ_WRITE_TOKEN env var (created automatically when you
// add the "Blob" storage integration to your Vercel project).
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const filename = `products/${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
  });

  return NextResponse.json({ url: blob.url });
}
