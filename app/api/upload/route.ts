import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from('product-photos')
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json({ error: 'Upload failed. Check that Supabase Storage is configured.' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('product-photos').getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed.' }, { status: 500 });
  }
}
