import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorized } from '@/lib/adminAuth';
import { sendEmail, NOTIFY_EMAIL } from '@/lib/email';
import { buildTeamNotificationEmail, buildCustomerConfirmationEmail, generateRequestNumber } from '@/lib/quoteEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9()+\-.\s]{7,20}$/;
const MAX_QUANTITY_PER_ITEM = 500;
const MAX_LINE_ITEMS = 100;

type IncomingItem = { productId: unknown; quantity: unknown };

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const deliveryAddress = typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const rawItems: IncomingItem[] = Array.isArray(body.items) ? body.items : [];

  // --- Validate customer fields -------------------------------------------------
  if (!name || name.length > 200) {
    return NextResponse.json({ error: 'Please provide a valid full name.' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: 'Please provide a valid phone number.' }, { status: 400 });
  }
  if (!deliveryAddress || deliveryAddress.length < 8 || deliveryAddress.length > 1000) {
    return NextResponse.json({ error: 'Please provide a complete delivery address.' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  // --- Validate cart items shape --------------------------------------------------
  if (rawItems.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }
  if (rawItems.length > MAX_LINE_ITEMS) {
    return NextResponse.json({ error: 'Too many items in cart.' }, { status: 400 });
  }

  const cleanedItems: { productId: string; quantity: number }[] = [];
  for (const raw of rawItems) {
    const productId = typeof raw.productId === 'string' ? raw.productId : '';
    const quantity = Number(raw.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return NextResponse.json({ error: 'Your cart contains an invalid item. Please review your cart and try again.' }, { status: 400 });
    }
    cleanedItems.push({ productId, quantity });
  }

  // --- CRITICAL: never trust price/name/etc from the client. Re-fetch from DB. ---
  const productIds = cleanedItems.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const missing = cleanedItems.filter((i) => !productMap.has(i.productId));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'One or more products in your cart are no longer available. Please review your cart.' },
      { status: 400 }
    );
  }

  const canonicalItems = cleanedItems.map((i) => {
    const product = productMap.get(i.productId)!;
    const lineTotal = product.price !== null ? product.price * i.quantity : null;
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: i.quantity,
      lineTotal,
    };
  });

  const itemCount = canonicalItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = canonicalItems.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
  const hasUnpricedItems = canonicalItems.some((i) => i.price === null);

  // --- Generate a unique request number, retrying on the rare collision ---------
  let requestNumber = generateRequestNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.cartOrderRequest.findUnique({ where: { requestNumber } });
    if (!existing) break;
    requestNumber = generateRequestNumber();
  }

  const quote = await prisma.cartOrderRequest.create({
    data: {
      requestNumber,
      status: 'New',
      name,
      email,
      phone,
      deliveryAddress,
      message: message || null,
      items: JSON.parse(JSON.stringify(canonicalItems)),
      itemCount,
      subtotal,
      hasUnpricedItems,
    },
  });

  // --- Send notification + confirmation emails. Failures here shouldn't fail the
  // request, since the quote is already safely saved. ----------------------------
  const emailData = {
    requestNumber: quote.requestNumber,
    name,
    email,
    phone,
    deliveryAddress,
    message: quote.message,
    items: canonicalItems,
    itemCount,
    subtotal,
    hasUnpricedItems,
    createdAt: quote.createdAt,
  };

  try {
    const teamEmail = buildTeamNotificationEmail(emailData);
    await sendEmail({ to: NOTIFY_EMAIL, subject: teamEmail.subject, html: teamEmail.html, replyTo: email });
  } catch (err) {
    console.error('[quote-cart] Failed to send team notification email', err);
  }

  try {
    const customerEmail = buildCustomerConfirmationEmail(emailData);
    await sendEmail({ to: email, subject: customerEmail.subject, html: customerEmail.html, replyTo: NOTIFY_EMAIL });
  } catch (err) {
    console.error('[quote-cart] Failed to send customer confirmation email', err);
  }

  return NextResponse.json({ ok: true, id: quote.id, requestNumber: quote.requestNumber });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const quotes = await prisma.cartOrderRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(quotes);
}
