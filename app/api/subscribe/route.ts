import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';
import { isValidEmail, isValidPhone, EMAIL_ERROR, PHONE_ERROR } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const { email, phone } = await req.json();

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return NextResponse.json({ error: EMAIL_ERROR }, { status: 400 });
  }
  if (!phone || typeof phone !== 'string' || !isValidPhone(phone)) {
    return NextResponse.json({ error: PHONE_ERROR }, { status: 400 });
  }

  try {
    const subscriber = await prisma.subscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { phone: phone.trim() },
      create: { email: email.toLowerCase().trim(), phone: phone.trim() },
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
