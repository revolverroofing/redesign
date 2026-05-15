import { LeadForm } from "@/components/lead-form";
import { business } from "@/lib/business";

export function CtaSection() {
  return (
    <section id="contact" className="bg-zinc-950 py-24 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-start">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready for a roof you don&apos;t have to think about?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Send us a few details and we&apos;ll have a project manager out within the
            week — no high-pressure sales, no &ldquo;today only&rdquo; pricing.
          </p>
          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex items-baseline gap-3">
              <dt className="w-16 text-zinc-500">Call</dt>
              <dd>
                <a
                  href={`tel:${business.phoneE164}`}
                  className="text-base font-semibold text-white hover:text-orange-300"
                  data-analytics="cta-phone"
                >
                  {business.phoneDisplay}
                </a>
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="w-16 text-zinc-500">Email</dt>
              <dd>
                <a
                  href={`mailto:${business.email}`}
                  className="text-base text-white hover:text-orange-300"
                >
                  {business.email}
                </a>
              </dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="w-16 text-zinc-500">Hours</dt>
              <dd className="text-base text-zinc-200">
                Mon–Fri 7a–6p · Sat 8a–2p
              </dd>
            </div>
          </dl>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
