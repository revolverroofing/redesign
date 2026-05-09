import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  type Severity,
  commercialBuildings,
  hailEvents,
} from "@/lib/hail-data";

const numberFmt = new Intl.NumberFormat("en-US");

export function HailStats() {
  const buildingsAtHighRisk = commercialBuildings.filter(
    (b) => b.roofAgeYears >= 13,
  ).length;
  const totalImpacted = hailEvents.reduce(
    (sum, event) => sum + event.buildingsImpacted,
    0,
  );

  const severityTotals: Record<Severity, number> = {
    severe: 0,
    moderate: 0,
    minor: 0,
  };
  for (const event of hailEvents) severityTotals[event.severity] += 1;

  const orderedSeverities: ReadonlyArray<Severity> = ["severe", "moderate", "minor"];

  return (
    <section className="border-b border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            label="Verified storms"
            value={hailEvents.length.toString()}
            sub="Cross-checked with NWS and ground reports"
          />
          <Card
            label="Buildings impacted (cumulative)"
            value={numberFmt.format(totalImpacted)}
            sub="Across the current tracking window"
          />
          <Card
            label="High-risk roofs"
            value={buildingsAtHighRisk.toString()}
            sub="13+ year-old systems on our watchlist"
          />
          <SeverityBreakdown
            totals={severityTotals}
            order={orderedSeverities}
          />
        </div>
      </div>
    </section>
  );
}

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        {value}
      </div>
      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>
    </div>
  );
}

function SeverityBreakdown({
  totals,
  order,
}: {
  totals: Record<Severity, number>;
  order: ReadonlyArray<Severity>;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        Severity breakdown
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {order.map((severity) => (
          <li
            key={severity}
            className="flex items-center justify-between text-zinc-700 dark:text-zinc-300"
          >
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SEVERITY_COLOR[severity] }}
              />
              {SEVERITY_LABEL[severity]}
            </span>
            <span className="font-semibold text-zinc-950 dark:text-white">
              {totals[severity]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
