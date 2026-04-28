const points = [
  { label: "Licensed & insured", detail: "PA #PA-1234, NJ #13VH-5678" },
  { label: "25-year warranty", detail: "On all workmanship" },
  { label: "Family-owned", detail: "Three generations, one roof at a time" },
  { label: "Free estimates", detail: "Same-week scheduling" },
];

export function TrustStrip() {
  return (
    <section id="why-us" className="border-b border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <div key={point.label}>
            <div className="text-base font-semibold text-zinc-950 dark:text-white">{point.label}</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{point.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
