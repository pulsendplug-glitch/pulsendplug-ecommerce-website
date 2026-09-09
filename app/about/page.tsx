import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-black/5 bg-pulse-fog py-16 dark:border-white/10 dark:bg-pulse-charcoal">
        <div className="container-max section-pad">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">About Us</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold md:text-5xl">
            We Help Businesses Give Their Customers an Experience Worth Remembering
          </h1>
        </div>
      </section>

      <section className="section-pad py-20">
        <div className="container-max grid items-center gap-14 md:grid-cols-2">
          <div>
            <p className="mb-4 text-black/70 dark:text-white/70">
              Pulse &amp; Plug is a premium health, wellness, recovery, and studio equipment company. We
              supply fitness studios, yoga and Pilates studios, chiropractic clinics, physical therapy and
              rehabilitation centers, recovery and wellness centers, and premium coworking spaces with the
              equipment that turns a good visit into a memorable one.
            </p>
            <p className="mb-4 text-black/70 dark:text-white/70">
              Our range spans massage chairs, infrared saunas, cold plunge systems, massage beds, recovery
              mattresses, Pilates reformers, yoga equipment, massage guns, resistance bands, acupressure
              products, and more.
            </p>
            <p className="text-black/70 dark:text-white/70">
              But our bigger idea isn&apos;t simply &ldquo;we sell equipment.&rdquo; It&apos;s that we help
              businesses upgrade the customer experience through premium wellness and recovery
              amenities that make clients feel comfortable, relaxed, and valued.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop"
              alt="Recovery equipment in a premium wellness studio"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-pulse-black py-20 text-white">
        <div className="container-max section-pad grid gap-10 md:grid-cols-3">
          {[
            {
              title: 'Customer Experience',
              body: 'We help businesses create environments where their customers feel more comfortable, relaxed, recovered, and valued.',
            },
            {
              title: 'Business Differentiation',
              body: 'We help studios, clinics, and gyms stand out by giving them amenities their competitors may not offer.',
            },
            {
              title: 'Additional Business Value',
              body: 'Our equipment can create new revenue opportunities through memberships, paid recovery sessions, retail, and upgraded services.',
            },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-white/10 p-8">
              <h3 className="mb-3 font-display text-xl font-semibold text-pulse-red">{v.title}</h3>
              <p className="text-white/70">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad py-20 text-center">
        <div className="container-max mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Our Philosophy</p>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            &ldquo;Don&apos;t just give customers a service. Give them an experience they remember.&rdquo;
          </h2>
        </div>
      </section>
    </>
  );
}
