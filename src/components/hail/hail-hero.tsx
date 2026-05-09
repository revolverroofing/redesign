import { commercialBuildings, hailEvents } from "@/lib/hail-data";

export function HailHero() {
  const trackedRoofs = commercialBuildings.length;
  const latestEventTime = hailEvents.reduce(
    (max, event) => Math.max(max, new Date(event.date).getTime()),
    0,
  );
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const stormsLast90 = hailEvents.filter(
    (event) => latestEventTime - new Date(event.date).getTime() <= ninetyDaysMs,
  ).length;

  return (
    <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-20 dark:border-zinc-800 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
          Commercial roof intelligence
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
          Know which roofs got hit before the claims line opens.
        </h1>
        <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">
          We cross-reference verified hail reports across the Tri-State area
          with every commercial roof in our service portfolio — so property
          managers know within hours whether their building was in the path of a
          damaging storm.
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <HeadlineStat
            value={hailEvents.length.toString()}
            label="Storms tracked this season"
          />
          <HeadlineStat value={`${stormsLast90}`} label="Hail events in the last 90 days" />
          <HeadlineStat
            value={trackedRoofs.toString()}
            label="Commercial roofs monitored"
          />
        </div>
      </div>
    </section>
  );
}

function HeadlineStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-3xl font-semibold text-zinc-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
    </div>
  );
}
