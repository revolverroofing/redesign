import type { Metadata } from "next";
import { BidForm } from "@/components/bid-form";
import { CommercialServiceSchema } from "@/components/commercial-service-schema";
import { business } from "@/lib/business";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const metadata: Metadata = {
  title: "For General Contractors — Invite us to bid",
  description: `${business.name} is a commercial roofing subcontractor for GCs across the ${business.serviceAreaSummary}. NAICS ${business.commercial.naicsCode}, CSI MasterFormat ${business.commercial.csiCode}. Invite us to bid your project — written response before your decision date.`,
  alternates: { canonical: "/contractors" },
};

export default function ContractorsPage() {
  const { commercial } = business;
  const bonding = commercial.capacity.bondingLimit;

  return (
    <>
      <CommercialServiceSchema />

      <section className="border-b border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-medium text-orange-600">For general contractors</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
            Subcontract your roof. Sleep through closeout.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            {business.name} responds to GC bid invitations across the {business.serviceAreaSummary}{" "}
            on TPO, EPDM, modified bitumen, BUR, PVC, and standing-seam metal. Written
            scope-aligned response back before your decision date — no late-day phone tag.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            <Stat label="NAICS" value={commercial.naicsCode} sub="Roofing Contractors" />
            <Stat
              label="CSI MasterFormat"
              value={commercial.csiCode}
              sub="Membrane Roofing"
            />
            <Stat
              label="Largest project"
              value={`${(commercial.capacity.largestProjectSqFt / 1000).toFixed(0)}k`}
              sub="sq ft, single phase"
            />
          </dl>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-4xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Systems we field
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {commercial.systems.map((system) => (
                <li key={system} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-orange-600" />
                  {system}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Capacity
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Active crews
                </dt>
                <dd>{commercial.capacity.activeCrews}, fully in-house</dd>
              </div>
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Bonding capacity
                </dt>
                <dd>
                  {usd.format(bonding.perProject)} per project ·{" "}
                  {usd.format(bonding.aggregate)} aggregate
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Project profiles
                </dt>
                <dd>
                  <ul className="mt-1 space-y-1">
                    {commercial.references.map((ref) => (
                      <li key={ref}>{ref}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Licenses
                </dt>
                <dd>
                  {business.licenses
                    .map((license) => `${license.state} #${license.number}`)
                    .join(" · ")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-start">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Send us your scope.
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              The more you can share — drawings, decision date, prebid notes — the
              tighter our response. Estimating routes this directly to a project
              manager, not a sales queue.
            </p>
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex items-baseline gap-3">
                <dt className="w-24 text-zinc-500">Estimating</dt>
                <dd>
                  <a
                    href={`tel:${business.phoneE164}`}
                    className="text-base font-semibold text-white hover:text-orange-300"
                    data-analytics="contractors-phone"
                  >
                    {business.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline gap-3">
                <dt className="w-24 text-zinc-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${business.email}`}
                    className="text-base text-white hover:text-orange-300"
                  >
                    {business.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <BidForm />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">
        {value}
      </dd>
      <dd className="text-sm text-zinc-600 dark:text-zinc-400">{sub}</dd>
    </div>
  );
}
