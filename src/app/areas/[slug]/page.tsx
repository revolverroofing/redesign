import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaSection } from "@/components/cta-section";
import { Services } from "@/components/services";
import { TrustStrip } from "@/components/trust-strip";
import { areas, areaSlugs } from "@/lib/areas-content";

export const dynamicParams = false;

export function generateStaticParams() {
  return areaSlugs.map((slug) => ({ slug }));
}

function getArea(slug: string) {
  return areas[slug] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  return {
    title: `Roofing in ${area.name}`,
    description: area.blurb,
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  return (
    <>
      <section className="border-b border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Home
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
            Roofing in {area.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            {area.blurb}
          </p>
          <p className="mt-6 text-sm text-zinc-500">{area.responseTime}</p>
        </div>
      </section>

      <Services />
      <TrustStrip />
      <CtaSection />
    </>
  );
}
