// Minimal email sender using the Resend HTTP API directly via fetch.
// No extra npm dependency required. Configure with:
//   RESEND_API_KEY   - your Resend API key
//   EMAIL_FROM       - a sender address on a domain you've verified in Resend
//                      (defaults to Resend's shared sandbox sender, which only
//                      reliably delivers to the email you signed up to Resend with)
//   NOTIFY_EMAIL     - where new quote requests are sent (defaults to
//                      pulsendplug@gmail.com)
//
// If RESEND_API_KEY is not set, sendEmail() logs a warning and skips sending
// instead of throwing, so the quote request can still be saved even before
// email is configured.

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Pulse & Plug <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn(
      '[email] RESEND_API_KEY is not set — skipping email send. Set RESEND_API_KEY (and ideally EMAIL_FROM) in your environment to enable quote notification emails.'
    );
    return { skipped: true as const };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[email] Failed to send email (${res.status}): ${text}`);
  }

  return res.json();
}

export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'pulsendplug@gmail.com';
