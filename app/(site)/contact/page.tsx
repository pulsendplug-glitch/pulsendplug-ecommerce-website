import { RetailQuoteForm } from '@/components/RetailQuoteForm';
import Link from 'next/link';
export default function ContactPage() {
  return (
    <>
      <section className="border-b border-black/5 bg-pulse-fog py-16 dark:border-white/10 dark:bg-pulse-charcoal">
        <div className="container-max section-pad">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-pulse-red">Contact</p>
          <h1 className="font-display text-4xl font-bold">Request a Quote</h1>
        </div>
      </section>
      <div className="bg-pulse-black text-white">
        <div className="container-max section-pad flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="text-sm text-white/70">Are you a business? Register for <span className="font-semibold text-white">20% off all equipment</span></p>
          <Link href="/business" className="rounded-full bg-pulse-red px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">Business Portal</Link>
        </div>
      </div>
      <section className="section-pad py-20">
        <div className="container-max grid gap-14 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-8">
            {[
              { label: 'Email', value: 'pulsendplug@gmail.com' },
              { label: 'Phone', value: '+1 786 406 6937' },
              { label: 'Hours', value: 'Monday to Friday, 9:00am to 6:00pm' },
              { label: 'Serving', value: 'Studios, clinics and wellness businesses nationwide' },
            ].map((item) => (
              <div key={item.label} className="card p-6">
                <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-pulse-red">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="card p-8">
            <RetailQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
