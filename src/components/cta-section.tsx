export function CtaSection() {
  return (
    <section id="contact" className="bg-zinc-950 py-24 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready for a roof you don&apos;t have to think about?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Send us a few details and we&apos;ll have a project manager out within the week —
            no high-pressure sales, no &ldquo;today only&rdquo; pricing.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="tel:+15555550123"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-700 px-6 font-medium transition-colors hover:bg-zinc-900"
          >
            Call (555) 555-0123
          </a>
          <a
            href="mailto:hello@revolverroofing.example"
            className="inline-flex h-12 items-center justify-center rounded-full bg-orange-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            Request an estimate
          </a>
        </div>
      </div>
    </section>
  );
}
