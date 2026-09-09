import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, business, message, isUsBased, discountCode, type } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  let discountPercent = 0;
  let discountApplied = false;

  // Business discount: 20% off
  if (type === 'business' && discountCode) {
    const reg = await prisma.businessRegistration.findUnique({
      where: { discountCode },
    });
    if (reg && reg.approved) {
      discountPercent = 20;
      discountApplied = true;
    }
  }

  // US citizen discount: 10% off (stacks with nothing — retail only)
  if (type === 'retail' && isUsBased) {
    discountPercent = 10;
    discountApplied = true;
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      name,
      email,
      phone,
      business,
      message,
      isUsBased: !!isUsBased,
      discountApplied,
      discountCode: discountCode || null,
      discountPercent,
      type: type || 'retail',
    },
  });

  return NextResponse.json({ ok: true, id: quote.id, discountPercent, discountApplied });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const quotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(quotes);
}
