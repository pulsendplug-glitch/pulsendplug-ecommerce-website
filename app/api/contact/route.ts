import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, business, email, phone, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const saved = await prisma.contactMessage.create({
    data: { name, business, email, phone, message },
  });

  // NOTE: this currently just stores the message in the database.
  // To get an email notification, wire this up to Resend/SendGrid/Postmark
  // and send yourself a copy here before returning.

  return NextResponse.json({ ok: true, id: saved.id });
}
