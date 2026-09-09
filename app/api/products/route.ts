import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, category, shortDesc, description, price, imageUrl, images, featured, inStock } = body;

  if (!name || !category || !shortDesc || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      category,
      shortDesc,
      description,
      price: price ? Number(price) : null,
      imageUrl: imageUrl || null,
      images: images || [],
      featured: !!featured,
      inStock: inStock !== false,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
