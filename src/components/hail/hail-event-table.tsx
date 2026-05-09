import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  hailEvents,
} from "@/lib/hail-data";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const numberFmt = new Intl.NumberFormat("en-US");

export function HailEventTable() {
  const sorted = [...hailEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <section className="border-b border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Recent storms
          </h2>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Reverse-chronological log of every verified hail event in the
            tracker. Sizes are reported in maximum observed hail diameter.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Date
                </th>
                <th scope="col" className="px-4 py-3">
                  Location
                </th>
                <th scope="col" className="px-4 py-3">
                  Severity
                </th>
                <th scope="col" className="px-4 py-3">
                  Hail size
                </th>
                <th scope="col" className="px-4 py-3">
                  Duration
                </th>
                <th scope="col" className="px-4 py-3">
                  Buildings impacted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sorted.map((event) => (
                <tr
                  key={event.id}
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-zinc-950 dark:text-white">
                    {dateFmt.format(new Date(event.date))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {event.city}, {event.state}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: SEVERITY_COLOR[event.severity] }}
                      />
                      {SEVERITY_LABEL[event.severity]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {event.hailSizeIn.toFixed(2)}″
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {event.durationMin} min
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {numberFmt.format(event.buildingsImpacted)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
