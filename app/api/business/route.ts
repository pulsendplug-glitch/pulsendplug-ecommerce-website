import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

function generateCode(businessName: string): string {
  const prefix = businessName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${suffix}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessName, regNumber, email, phone } = body;

  if (!businessName || !regNumber || !email) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Check if already registered
  const existing = await prisma.businessRegistration.findFirst({
    where: { OR: [{ email }, { regNumber }] },
  });

  if (existing) {
    return NextResponse.json({
      ok: true,
      discountCode: existing.discountCode,
      alreadyRegistered: true,
    });
  }

  const discountCode = generateCode(businessName);

  const registration = await prisma.businessRegistration.create({
    data: { businessName, regNumber, email, phone, discountCode, approved: true },
  });

  return NextResponse.json({ ok: true, discountCode: registration.discountCode });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const businesses = await prisma.businessRegistration.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(businesses);
}
