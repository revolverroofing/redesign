import {
  type CommercialBuilding,
  commercialBuildings,
  eventsById,
} from "@/lib/hail-data";

const numberFmt = new Intl.NumberFormat("en-US");
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type RiskTier = "low" | "elevated" | "high";

function riskTier(building: CommercialBuilding): RiskTier {
  const severeHits = building.affectingEventIds
    .map((id) => eventsById().get(id))
    .filter((event) => event?.severity === "severe").length;
  if (severeHits >= 2 || building.roofAgeYears >= 14) return "high";
  if (severeHits >= 1 || building.roofAgeYears >= 8) return "elevated";
  return "low";
}

const TIER_BADGE: Record<RiskTier, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  elevated:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

const TIER_LABEL: Record<RiskTier, string> = {
  high: "High",
  elevated: "Elevated",
  low: "Low",
};

const TIER_RANK: Record<RiskTier, number> = {
  high: 0,
  elevated: 1,
  low: 2,
};

export function BuildingsAtRisk() {
  const sorted = [...commercialBuildings].sort((a, b) => {
    const rankA = TIER_RANK[riskTier(a)];
    const rankB = TIER_RANK[riskTier(b)];
    if (rankA !== rankB) return rankA - rankB;
    return b.roofAgeYears - a.roofAgeYears;
  });

  return (
    <section
      id="buildings"
      className="border-b border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Buildings at risk
          </h2>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Ranked by recent severe-storm exposure and roof age. The buildings
            at the top should be next on the inspection schedule.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Building
                </th>
                <th scope="col" className="px-4 py-3">
                  Location
                </th>
                <th scope="col" className="px-4 py-3">
                  Roof
                </th>
                <th scope="col" className="px-4 py-3">
                  Sq ft
                </th>
                <th scope="col" className="px-4 py-3">
                  Storms
                </th>
                <th scope="col" className="px-4 py-3">
                  Last inspected
                </th>
                <th scope="col" className="px-4 py-3">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sorted.map((building) => {
                const tier = riskTier(building);
                return (
                  <tr key={building.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-950 dark:text-white">
                        {building.name}
                      </div>
                      <div className="text-xs capitalize text-zinc-500 dark:text-zinc-500">
                        {building.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {building.city}, {building.state}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {building.roofSystem}{" "}
                      <span className="text-zinc-500 dark:text-zinc-500">
                        · {building.roofAgeYears} yr
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {numberFmt.format(building.squareFeet)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {building.affectingEventIds.length}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {dateFmt.format(new Date(building.lastInspected))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_BADGE[tier]}`}
                      >
                        {TIER_LABEL[tier]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
