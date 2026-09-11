# Pulse & Plug — Website

A modern, multi-page Next.js site for Pulse & Plug (premium wellness & recovery
equipment). Includes a Postgres-backed product catalog, an admin panel for
adding/editing products and photos, dark/light mode, and a cursor-following
red glow effect.

## What's inside

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **Postgres** for the product catalog and contact messages
- A full **shopping cart** (persisted in the browser) with a
  **Request a Quote checkout** — since online payment isn't live yet,
  "Checkout" walks customers through submitting their cart as a quote request
  instead of taking payment
- **Vercel Blob** for product photo uploads
- **next-themes** for dark/light mode
- A lightweight **/admin** panel (password-protected) to add, edit, and
  delete products and upload photos — no code required after setup
- Pages: Home, Shop (with category filtering), Product detail, About, Contact

## 1. Install dependencies

```bash
npm install
```

## 2. Set up your database

You need a free Postgres database. The easiest options:

- **Neon** (https://neon.tech) — free tier, takes 2 minutes
- **Vercel Postgres** — from your Vercel project's Storage tab
- **Supabase** — also has a free Postgres tier

Copy `.env.example` to `.env` and paste in your connection string:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="choose-a-strong-password"
```

Then push the schema and seed some starter products:

```bash
npx prisma db push
npm run db:seed
```

## 3. Run locally

```bash
npm run dev
```

Visit http://localhost:3000. Go to http://localhost:3000/admin and log in
with the `ADMIN_PASSWORD` you set to add real products and photos.

## 4. Photo uploads (Vercel Blob)

Product photo uploads use Vercel Blob storage. To enable it:

1. Push this project to Vercel (see below).
2. In your Vercel project, go to **Storage → Create Database → Blob**.
3. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` env var to your project.
4. Pull it into your local `.env` too if you want uploads to work locally:
   ```bash
   npx vercel env pull .env
   ```

Until Blob is connected, you can still add products by pasting an image URL
directly into the "Product Photo" preview via the admin panel's image field,
or by editing the `imageUrl` field through the API.

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Pulse & Plug site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pulse-and-plug.git
git push -u origin main
```

## 6. Deploy to Vercel

1. Go to https://vercel.com/new and import your GitHub repo.
2. Add the environment variables from your `.env` file
   (`DATABASE_URL`, `ADMIN_PASSWORD`) in the Vercel project settings.
3. Add Blob storage (Storage → Create Database → Blob) — this sets
   `BLOB_READ_WRITE_TOKEN` automatically.
4. Deploy. Vercel will run `prisma generate && next build` automatically
   (already wired up in `package.json`).
5. After the first deploy, run the schema push once against your production
   database (from your machine, with the production `DATABASE_URL` in `.env`):
   ```bash
   npx prisma db push
   npm run db:seed   # optional — adds sample products
   ```

## Managing products

Go to `/admin` on your deployed site, log in with your `ADMIN_PASSWORD`, and
you can:

- Add a new product (name, category, description, price, photo)
- Edit or delete any existing product
- Mark a product as "Featured" to show it on the homepage
- Mark a product "In stock" / "Out of stock"

## Customizing the design

- **Colors**: edit `tailwind.config.ts` under `theme.extend.colors.pulse`
- **Fonts**: edit `app/layout.tsx` (currently Space Grotesk + Inter from Google Fonts)
- **Cursor glow color/size**: edit `#cursor-glow` in `app/globals.css`
- **Default dark/light mode**: edit `defaultTheme` in `app/layout.tsx`

## Notes on security

The admin panel uses a single shared password (`ADMIN_PASSWORD`) checked on
each write request — simple by design for a small internal tool run by one
or two people. If you later want individual staff logins, audit logs, or
public-facing admin access, swap `lib/adminAuth.ts` for a real auth solution
such as NextAuth.js.

The contact form currently saves messages to the database only. To get an
email notification when someone submits the form, connect an email service
(e.g. Resend or Postmark) inside `app/api/contact/route.ts`.

## Cart & "Request a Quote" checkout

Online payment checkout isn't live yet, so the site uses a cart-based quote
request as the temporary final checkout step:

1. Customers browse, add products to their cart (persisted in
   `localStorage`, so it survives a page refresh), and adjust quantities
   from the cart icon in the header or the `/cart` page.
2. Clicking **Checkout** shows a modal explaining that online checkout is
   temporarily unavailable, with a button to continue to `/request-quote`.
3. `/request-quote` automatically loads the cart as a **read-only** summary
   — customers can't edit product names, prices, or quantities from this
   screen; they have to go back to `/cart` to change anything.
4. After entering their name, email, phone, and delivery address, submitting
   the form hits `POST /api/quote-cart`, which:
   - **never trusts the browser's price/name/quantity data** — it re-fetches
     every product from the database by ID and recalculates everything
     server-side before saving,
   - saves the request to the new `CartOrderRequest` table with a unique,
     human-readable request number (e.g. `PP-4F92K1`),
   - emails a full breakdown to your team inbox and a confirmation to the
     customer (see below to enable email).
5. Staff manage requests from the **Orders** tab in `/admin` — full item
   breakdown per request, plus a status dropdown (New → Reviewing → Quote
   Sent → Awaiting Customer → Confirmed → Completed/Cancelled).

**To enable email notifications:**

1. Create a free account at https://resend.com and grab an API key.
2. Add `RESEND_API_KEY` to your `.env` (and to Vercel's project settings).
3. Optionally verify your own sending domain in Resend and set `EMAIL_FROM`
   to an address on that domain (e.g. `Pulse & Plug <orders@pulseandplug.com>`).
   Until you do, emails send from Resend's shared sandbox address, which only
   reliably delivers to the email you signed up to Resend with — fine for
   testing, not for production.
4. `NOTIFY_EMAIL` controls where new quote requests are sent internally;
   it defaults to `pulsendplug@gmail.com` if not set.

If `RESEND_API_KEY` isn't set, quote requests still save correctly to the
database — the app just logs a warning and skips sending the email, so
nothing breaks before you've configured it.

**Important:** because this adds a new database table, remember to run the
schema push again (locally and/or against your production database) after
pulling this update:

```bash
npx prisma db push
```
