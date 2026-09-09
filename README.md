# Pulse & Plug — Website

A modern, multi-page Next.js site for Pulse & Plug (premium wellness & recovery
equipment). Includes a Postgres-backed product catalog, an admin panel for
adding/editing products and photos, dark/light mode, and a cursor-following
red glow effect.

## What's inside

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **Postgres** for the product catalog and contact messages
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
