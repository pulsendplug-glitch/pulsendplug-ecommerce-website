import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

const ALLOWED_STATUSES = ['New', 'Reviewing', 'Quote Sent', 'Awaiting Customer', 'Confirmed', 'Completed', 'Cancelled'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const status = typeof body.status === 'string' ? body.status : '';

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const updated = await prisma.cartOrderRequest.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const quote = await prisma.cartOrderRequest.findUnique({ where: { id: params.id } });
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(quote);
}
