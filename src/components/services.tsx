const services = [
  {
    title: "Residential Roofing",
    description:
      "Asphalt shingle, metal, and tile installations for single-family homes. Tear-offs, re-roofs, and storm damage rebuilds.",
  },
  {
    title: "Commercial Roofing",
    description:
      "TPO, EPDM, and modified bitumen systems for low-slope commercial buildings. Scheduled to minimize tenant disruption.",
  },
  {
    title: "Repairs & Maintenance",
    description:
      "Leak diagnostics, flashing repair, gutter work, and annual inspections — typically scheduled within 48 hours.",
  },
];

export function Services() {
  return (
    <section id="services" className="border-b border-zinc-200 bg-white py-24 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            What we do
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            One crew, fully in-house. We don&apos;t subcontract installs, and the foreman who
            quotes your job is on-site the day we tear it off.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{service.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
