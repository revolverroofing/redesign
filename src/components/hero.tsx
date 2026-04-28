export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 sm:py-32 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
            Licensed, insured, locally owned since 1998
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white">
            Roofs that last. Service that&apos;s on time.
          </h1>
          <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            Residential and commercial roofing across the Tri-State area. Free estimates,
            transparent pricing, and a 25-year workmanship warranty on every install.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-orange-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
            >
              Get a free estimate
            </a>
            <a
              href="#services"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              See what we do
            </a>
          </div>
        </div>
        <div
          aria-hidden
          className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,88,12,0.18),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(24,24,27,0.12),transparent_55%)]" />
          <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4 text-center">
            {[
              { stat: "4,200+", label: "Roofs installed" },
              { stat: "25 yr", label: "Workmanship warranty" },
              { stat: "4.9★", label: "Avg. customer rating" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-200 bg-white/80 p-3 text-zinc-900 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-100"
              >
                <div className="text-xl font-semibold">{item.stat}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
