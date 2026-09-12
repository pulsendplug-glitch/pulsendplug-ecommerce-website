import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { CountdownTimer } from '@/components/CountdownTimer';

export const dynamic = 'force-dynamic';

const categories = [
  { name: 'Recovery Chairs', desc: 'Zero gravity massage and recline' },
  { name: 'Saunas', desc: 'Full spectrum infrared' },
  { name: 'Cold Plunge', desc: 'Contrast therapy systems' },
  { name: 'Pilates & Studio', desc: 'Reformers & studio gear' },
  { name: 'Clinical & Rehab', desc: 'Tables & therapy tools' },
  { name: 'Recovery Tools', desc: 'Percussion, bands & more' },
];

const values = [
  {
    title: 'Customer Experience',
    body: 'Help your clients feel more comfortable, relaxed, recovered, and valued every time they walk in.',
  },
  {
    title: 'Business Differentiation',
    body: 'Stand out from competitors with premium amenities most studios and clinics simply don\u2019t offer.',
  },
  {
    title: 'Additional Revenue',
    body: 'Turn equipment into memberships, paid recovery sessions, packages, and upgraded services.',
  },
];

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      {/* BUSINESS DEAL BANNER */}
      <div className="bg-pulse-red text-white">
        <div className="container-max section-pad flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold">Business Deal: 20% off all equipment</span>
            <CountdownTimer compact />
          </div>
          <Link href="/business" className="rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-wide text-pulse-red hover:bg-white/90">
            Claim Discount
          </Link>
        </div>
      </div>

      {/* HERO: fullscreen scroll and drag scrubbed 360 turntable */}
      <HeroTurntable>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">
          Premium Wellness &amp; Recovery Equipment
        </p>
        <h1 className="mb-6 max-w-4xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
          Don&apos;t Just Give Customers a Service.
          <span className="text-pulse-red"> Give Them an Experience.</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-white/85">
          Pulse &amp; Plug supplies premium massage chairs, infrared saunas, cold plunge systems, and
          recovery equipment to fitness studios, clinics, and wellness businesses that want to give
          their clients something to look forward to.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="btn-primary">Shop Equipment</Link>
          <Link href="/contact" className="btn-outline border-white text-white hover:border-pulse-red">Request a Quote</Link>
        </div>
      </HeroTurntable>

      {/* VALUE PROPS STRIP */}
      <section className="border-b border-black/5 dark:border-white/10">
        <div className="container-max section-pad grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Free Site Consultation', sub: 'We help plan your layout' },
            { label: 'White Glove Delivery', sub: 'Install & setup included' },
            { label: 'Business Financing', sub: 'Flexible payment options' },
            { label: 'Ongoing Support', sub: 'Maintenance & service plans' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-pulse-red" />
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-black/60 dark:text-white/60">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OUR BIGGER IDEA */}
      <section className="section-pad py-24">
        <div className="container-max grid items-center gap-14 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop"
              alt="Client relaxing in a premium massage chair at a wellness studio"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Our Philosophy</p>
            <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl">
              We Help Businesses Upgrade the Customer Experience
            </h2>
            <p className="mb-6 text-black/70 dark:text-white/70">
              A fitness studio can offer an excellent workout, and adding a premium recovery area gives
              members something extra to look forward to. A chiropractic or PT clinic can use recovery
              equipment to make the environment more comfortable. A yoga or Pilates studio can feel more
              premium and differentiated from the studio down the street.
            </p>
            <div className="space-y-6">
              {values.map((v) => (
                <div key={v.title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pulse-red/10 text-pulse-red">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{v.title}</p>
                    <p className="text-sm text-black/60 dark:text-white/60">{v.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-pulse-fog py-24 dark:bg-pulse-charcoal">
        <div className="container-max section-pad">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">What We Supply</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Shop by Category</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="card flex items-center gap-4 p-6"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pulse-red/10 font-display text-lg font-bold text-pulse-red">
                  {cat.name.charAt(0)}
                </span>
                <div>
                  <p className="font-display font-semibold">{cat.name}</p>
                  <p className="text-sm text-black/60 dark:text-white/60">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="section-pad py-24">
          <div className="container-max">
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Best Sellers</p>
                <h2 className="font-display text-3xl font-bold md:text-4xl">Featured Equipment</h2>
              </div>
              <Link href="/shop" className="btn-outline">View All Equipment</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHO WE SERVE */}
      <section className="bg-pulse-black py-24 text-white">
        <div className="container-max section-pad">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Who We Serve</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Built for Every Kind of Wellness Business</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              'Fitness Studios & Gyms',
              'Yoga Studios',
              'Pilates & Reformer Studios',
              'Chiropractic Clinics',
              'Physical Therapy Centers',
              'Recovery & Wellness Centers',
              'Premium Coworking Spaces',
              'Therapeutic Businesses',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 p-6 text-center">
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad py-24">
        <div className="container-max rounded-3xl bg-gradient-to-br from-pulse-red to-pulse-redDark p-12 text-center text-white md:p-20">
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
            Ready to Upgrade Your Client Experience?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/90">
            Tell us about your studio, clinic, or wellness space, and we&apos;ll help you find the right
            equipment to differentiate your business and delight your clients.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-wide text-pulse-red transition-transform hover:scale-105">
            Request a Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
