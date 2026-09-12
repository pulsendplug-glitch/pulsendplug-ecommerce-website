export type QuoteEmailItem = {
  name: string;
  quantity: number;
  price: number | null;
  lineTotal: number | null;
  options?: string | null;
};

export type QuoteEmailData = {
  requestNumber: string;
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  message?: string | null;
  items: QuoteEmailItem[];
  itemCount: number;
  subtotal: number;
  hasUnpricedItems: boolean;
  createdAt: Date;
};

function money(n: number | null) {
  if (n === null) return 'Request Pricing';
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Internal notification email sent to the Pulse & Plug team. */
export function buildTeamNotificationEmail(q: QuoteEmailData) {
  const rows = q.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}${
          item.options ? `<br/><span style="color:#777;font-size:12px;">${escapeHtml(item.options)}</span>` : ''
        }</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${money(item.price)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${money(item.lineTotal)}</td>
      </tr>`
    )
    .join('');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111;">
    <div style="background:#e11d2e;color:#fff;padding:20px 24px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:20px;">New Quote Request #${escapeHtml(q.requestNumber)}</h1>
      <p style="margin:4px 0 0;opacity:.9;font-size:13px;">Pulse &amp; Plug, ${q.createdAt.toLocaleString()}</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
      <h2 style="font-size:15px;margin:0 0 10px;">Customer Information</h2>
      <table style="width:100%;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:2px 0;color:#666;width:140px;">Name</td><td>${escapeHtml(q.name)}</td></tr>
        <tr><td style="padding:2px 0;color:#666;">Email</td><td>${escapeHtml(q.email)}</td></tr>
        <tr><td style="padding:2px 0;color:#666;">Phone</td><td>${escapeHtml(q.phone)}</td></tr>
        <tr><td style="padding:2px 0;color:#666;vertical-align:top;">Delivery Address</td><td style="white-space:pre-wrap;">${escapeHtml(q.deliveryAddress)}</td></tr>
      </table>

      <h2 style="font-size:15px;margin:0 0 10px;">Requested Products</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="text-align:left;padding:8px 12px;">Product</th>
            <th style="text-align:center;padding:8px 12px;">Qty</th>
            <th style="text-align:right;padding:8px 12px;">Price</th>
            <th style="text-align:right;padding:8px 12px;">Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <table style="width:100%;font-size:14px;margin-bottom:20px;">
        <tr><td style="padding:2px 0;color:#666;width:160px;">Total Items</td><td>${q.itemCount}</td></tr>
        <tr><td style="padding:2px 0;color:#666;">Estimated Subtotal</td><td>${money(q.subtotal)}${q.hasUnpricedItems ? ' <span style="color:#999;">(some items require custom pricing)</span>' : ''}</td></tr>
        <tr><td style="padding:2px 0;color:#666;">Quote Request ID</td><td>${escapeHtml(q.requestNumber)}</td></tr>
        <tr><td style="padding:2px 0;color:#666;">Date &amp; Time</td><td>${q.createdAt.toLocaleString()}</td></tr>
      </table>

      ${
        q.message
          ? `<h2 style="font-size:15px;margin:0 0 8px;">Customer Message</h2><p style="font-size:14px;white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:8px;">${escapeHtml(q.message)}</p>`
          : ''
      }
    </div>
  </div>`;

  return {
    subject: `New Quote Request #${q.requestNumber} | Pulse & Plug`,
    html,
  };
}

/** Confirmation email sent back to the customer. */
export function buildCustomerConfirmationEmail(q: QuoteEmailData) {
  const rows = q.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${money(item.lineTotal)}</td>
      </tr>`
    )
    .join('');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111;">
    <div style="background:#0a0a0b;color:#fff;padding:20px 24px;border-radius:10px 10px 0 0;">
      <h1 style="margin:0;font-size:20px;">Quote Request Received</h1>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
      <p style="font-size:14px;">Thank you for choosing Pulse &amp; Plug, ${escapeHtml(q.name)}.</p>
      <p style="font-size:14px;">We've received your request and our team will review your order details. We'll contact you at ${escapeHtml(
        q.phone
      )} or ${escapeHtml(q.email)} to discuss your quote, delivery, and final payment arrangements.</p>
      <p style="font-size:14px;"><strong>Quote Request #: ${escapeHtml(q.requestNumber)}</strong></p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="text-align:left;padding:8px 12px;">Product</th>
            <th style="text-align:center;padding:8px 12px;">Qty</th>
            <th style="text-align:right;padding:8px 12px;">Line Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:14px;">Estimated Cart Total: <strong>${money(q.subtotal)}</strong>${
        q.hasUnpricedItems ? ' (some items require custom pricing)' : ''
      }</p>
    </div>
  </div>`;

  return {
    subject: `We've Received Your Quote Request #${q.requestNumber} | Pulse & Plug`,
    html,
  };
}

/** Generates a short, human-friendly, unique-enough request number like PP-4F92K1. */
export function generateRequestNumber() {
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `PP-${time}${rand}`;
}
