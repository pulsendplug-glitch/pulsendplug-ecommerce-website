import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const { email, phone } = await req.json();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const subscriber = await prisma.subscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { phone: phone || undefined },
      create: { email: email.toLowerCase().trim(), phone: phone || null },
    });
    return NextResponse.json({ ok: true, subscriber });
  } catch (err: any) {
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(subscribers);
}
