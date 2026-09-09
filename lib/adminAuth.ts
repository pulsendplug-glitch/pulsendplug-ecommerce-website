import { NextRequest } from 'next/server';

/**
 * Very lightweight admin protection for the products API.
 * The admin page collects a password and sends it as the
 * `x-admin-key` header on every mutating request. Compare it
 * against the ADMIN_PASSWORD environment variable.
 *
 * NOTE: this is intentionally simple for a small internal tool.
 * If Pulse & Plug ever has multiple staff logging in, or the
 * admin panel becomes public-facing, swap this for a real auth
 * solution (e.g. NextAuth.js with email/password or magic links).
 */
export function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key');
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return key === expected;
}
