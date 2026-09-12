// Shared validation used by both the newsletter gate (client) and the
// /api/subscribe route (server), so the rules can never drift apart.

// Reasonably strict RFC 5322-style email pattern — real local-part
// characters, a real domain with at least one dot, no consecutive dots,
// no spaces.
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(raw: string): boolean {
  const value = raw.trim();
  if (!value || value.length > 254) return false;
  if (value.includes('..')) return false;
  return EMAIL_REGEX.test(value);
}

// Requires a leading "+" country code and at least 11 digits total
// (spaces/dashes in the input are ignored for counting, e.g. "+1 555 123
// 4567" is fine to type).
export function isValidPhone(raw: string): boolean {
  const value = raw.trim();
  if (!value.startsWith('+')) return false;
  const digits = value.slice(1).replace(/[\s-]/g, '');
  if (!/^\d+$/.test(digits)) return false;
  return digits.length >= 11 && digits.length <= 15;
}

export const EMAIL_ERROR = 'Please enter a real email address (e.g. name@example.com).';
export const PHONE_ERROR = 'Please enter a phone number with a country code (e.g. +1 5551234567) and at least 11 digits.';
