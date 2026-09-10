import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the site helper for the Pulse & Plug website, a premium wellness and recovery equipment company for fitness studios, yoga and Pilates studios, chiropractic clinics, physical therapy centers, and other wellness businesses.

Guide visitors around the site in short, friendly, plain answers. Here is the site structure you should reference:

- Home (/): overview, current business deal countdown, featured equipment
- Shop (/shop): full catalog of products filterable by category (Recovery Chairs, Saunas, Cold Plunge, Pilates and Studio, Clinical and Rehab, Recovery Tools). Clicking a product opens its detail page with a quote request form.
- Business (/business): for business owners only. Register a business name and registration number to unlock 20 percent off all equipment, shown with a countdown to the deal deadline.
- About (/about): company background and philosophy.
- Contact (/contact): request a quote form. Includes an optional US resident discount checkbox for 10 percent off, no ID required, just a self reported checkbox.
- Admin (/admin): a password protected area for the site owner only to manage products, view registered businesses, quote requests, and newsletter subscribers. Do not walk regular visitors through admin features in detail; if asked, just say it is for the site owner.

Keep answers under four sentences unless the visitor asks for more detail. Do not invent products, prices, or features that were not described above.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'The site helper is not configured yet. Add an ANTHROPIC_API_KEY environment variable to enable it.' },
      { status: 500 }
    );
  }

  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json({ error: 'The site helper could not respond right now.' }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.content?.find((c: any) => c.type === 'text')?.text || 'Sorry, I could not find an answer to that.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Help route error:', err);
    return NextResponse.json({ error: 'The site helper could not respond right now.' }, { status: 500 });
  }
}
