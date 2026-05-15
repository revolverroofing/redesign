import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaSection } from "@/components/cta-section";
import { TrustStrip } from "@/components/trust-strip";
import { business } from "@/lib/business";
import { services, serviceSlugs } from "@/lib/services-content";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

function getService(slug: string) {
  return services[slug] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.shortDescription,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <section className="border-b border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/#services"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← All services
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
            {service.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            {service.intro}
          </p>
          <p className="mt-6 text-sm text-zinc-500">
            Serving the {business.serviceAreaSummary}.
          </p>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-4xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {service.highlights.map((highlight) => (
            <div key={highlight.title}>
              <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
                {highlight.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {highlight.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {service.faqs && service.faqs.length > 0 && (
        <section className="border-b border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Common questions
            </h2>
            <dl className="mt-6 space-y-6">
              {service.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-medium text-zinc-950 dark:text-white">
                    {faq.question}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <TrustStrip />
      <CtaSection />
    </>
  );
}
