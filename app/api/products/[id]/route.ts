import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, category, shortDesc, description, price, imageUrl, images, featured, inStock } = body;

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(shortDesc !== undefined ? { shortDesc } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: price ? Number(price) : null } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(images !== undefined ? { images } : {}),
      ...(featured !== undefined ? { featured: !!featured } : {}),
      ...(inStock !== undefined ? { inStock: !!inStock } : {}),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
