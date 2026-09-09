import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const subscriber = await prisma.subscriber.create({
      data: { email: email.toLowerCase().trim() },
    });
    return NextResponse.json({ ok: true, subscriber });
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Unique constraint — already subscribed, treat as success
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 500 });
  }
}

// Admin-only: list all subscribers
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(subscribers);
}
