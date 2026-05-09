"use client";

import { useMemo, useState } from "react";
import {
  type CommercialBuilding,
  type HailEvent,
  type Severity,
  REFERENCE_CITIES,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  buildingsById,
  commercialBuildings,
  eventsById,
  hailEvents,
  projectLatLng,
} from "@/lib/hail-data";

const MAP_W = 880;
const MAP_H = 560;

type SeverityFilter = Severity | "all";

const SEVERITY_FILTERS: ReadonlyArray<{ value: SeverityFilter; label: string }> = [
  { value: "all", label: "All severities" },
  { value: "severe", label: "Severe" },
  { value: "moderate", label: "Moderate" },
  { value: "minor", label: "Minor" },
];

const NJ_POLYGON: ReadonlyArray<[number, number]> = [
  [41.32, -74.69],
  [41.01, -73.9],
  [40.5, -74.04],
  [40.1, -74.04],
  [39.55, -74.4],
  [39.55, -75.55],
  [40.07, -74.86],
  [40.58, -75.19],
  [40.98, -75.13],
];

const NY_POLYGON: ReadonlyArray<[number, number]> = [
  [41.4, -74.69],
  [41.4, -73.3],
  [40.55, -73.3],
  [40.5, -74.04],
  [41.01, -73.9],
];

const PA_POLYGON: ReadonlyArray<[number, number]> = [
  [41.4, -76.5],
  [41.4, -74.69],
  [40.98, -75.13],
  [40.58, -75.19],
  [40.07, -74.86],
  [39.55, -75.55],
  [39.55, -76.5],
];

function polygonPath(coords: ReadonlyArray<[number, number]>) {
  return coords
    .map(([lat, lng], i) => {
      const { x, y } = projectLatLng(lat, lng, MAP_W, MAP_H);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .concat("Z")
    .join(" ");
}

function eventRadius(sizeIn: number) {
  return Math.min(22, Math.max(6, sizeIn * 9));
}

function buildingRisk(ageYears: number): "low" | "elevated" | "high" {
  if (ageYears < 7) return "low";
  if (ageYears < 13) return "elevated";
  return "high";
}

const RISK_FILL: Record<ReturnType<typeof buildingRisk>, string> = {
  low: "#16a34a",
  elevated: "#d97706",
  high: "#b91c1c",
};

const RISK_LABEL: Record<ReturnType<typeof buildingRisk>, string> = {
  low: "Low risk · roof < 7 yr",
  elevated: "Elevated · roof 7–12 yr",
  high: "High risk · roof 13 yr+",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const numberFmt = new Intl.NumberFormat("en-US");

export function HailTracker() {
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const visibleEvents = useMemo(
    () =>
      filter === "all"
        ? hailEvents
        : hailEvents.filter((event) => event.severity === filter),
    [filter],
  );

  const selectedEvent = useMemo<HailEvent | undefined>(
    () => (selectedEventId ? eventsById().get(selectedEventId) : undefined),
    [selectedEventId],
  );

  const selectedBuilding = useMemo<CommercialBuilding | undefined>(
    () => (selectedBuildingId ? buildingsById().get(selectedBuildingId) : undefined),
    [selectedBuildingId],
  );

  const affectedBuildingsForEvent = useMemo(() => {
    if (!selectedEvent) return [];
    return commercialBuildings.filter((b) =>
      b.affectingEventIds.includes(selectedEvent.id),
    );
  }, [selectedEvent]);

  const eventsForBuilding = useMemo(() => {
    if (!selectedBuilding) return [];
    const lookup = eventsById();
    return selectedBuilding.affectingEventIds
      .map((id) => lookup.get(id))
      .filter((event): event is HailEvent => Boolean(event));
  }, [selectedBuilding]);

  return (
    <section
      id="map"
      aria-labelledby="hail-tracker-heading"
      className="border-b border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-700 dark:text-orange-400">
            Live tracker
          </p>
          <h2
            id="hail-tracker-heading"
            className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white"
          >
            Tri-State hail map
          </h2>
          <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Verified storm reports cross-referenced against commercial roofs we
            inspect. Click a storm or building to see impact details and
            recommended next steps.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter by hail severity"
          className="mt-8 flex flex-wrap gap-2"
        >
          {SEVERITY_FILTERS.map((option) => {
            const isActive = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(option.value)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {option.value !== "all" && (
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLOR[option.value] }}
                  />
                )}
                {option.label}
              </button>
            );
          })}
          <span className="ml-auto self-center text-sm text-zinc-500 dark:text-zinc-400">
            Showing{" "}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {visibleEvents.length}
            </strong>{" "}
            of {hailEvents.length} storms
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <svg
              role="img"
              aria-label="Map of the Tri-State area showing recent hail events and tracked commercial buildings"
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              className="block h-auto w-full"
            >
              <defs>
                <linearGradient id="hail-map-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eef2f7" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <pattern
                  id="hail-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M40 0 L0 0 0 40"
                    fill="none"
                    stroke="rgba(15,23,42,0.06)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              <rect width={MAP_W} height={MAP_H} fill="url(#hail-map-bg)" />
              <rect width={MAP_W} height={MAP_H} fill="url(#hail-grid)" />

              <path
                d={polygonPath(PA_POLYGON)}
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <path
                d={polygonPath(NJ_POLYGON)}
                fill="#a7f3d0"
                stroke="#34d399"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <path
                d={polygonPath(NY_POLYGON)}
                fill="#bfdbfe"
                stroke="#60a5fa"
                strokeWidth="1.5"
                opacity="0.85"
              />

              <text x={120} y={130} className="fill-slate-600" fontSize="20" fontWeight="600" opacity="0.6">
                PA
              </text>
              <text x={520} y={150} className="fill-slate-600" fontSize="20" fontWeight="600" opacity="0.6">
                NY
              </text>
              <text x={500} y={380} className="fill-slate-600" fontSize="20" fontWeight="600" opacity="0.6">
                NJ
              </text>

              {REFERENCE_CITIES.map((city) => {
                const { x, y } = projectLatLng(city.lat, city.lng, MAP_W, MAP_H);
                return (
                  <g key={city.name} aria-hidden>
                    <circle cx={x} cy={y} r={2.5} fill="#475569" />
                    <text
                      x={x + 6}
                      y={y - 4}
                      fontSize="10"
                      fill="#475569"
                      className="pointer-events-none select-none"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}

              {commercialBuildings.map((building) => {
                const { x, y } = projectLatLng(
                  building.lat,
                  building.lng,
                  MAP_W,
                  MAP_H,
                );
                const risk = buildingRisk(building.roofAgeYears);
                const isSelected = building.id === selectedBuildingId;
                const size = isSelected ? 14 : 10;
                return (
                  <g key={building.id}>
                    {isSelected && (
                      <rect
                        x={x - 11}
                        y={y - 11}
                        width={22}
                        height={22}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        rx="3"
                      />
                    )}
                    <rect
                      x={x - size / 2}
                      y={y - size / 2}
                      width={size}
                      height={size}
                      rx="2"
                      fill={RISK_FILL[risk]}
                      stroke="#0f172a"
                      strokeWidth="1"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedBuildingId(building.id);
                        setSelectedEventId(null);
                      }}
                    >
                      <title>
                        {building.name} — {building.city}, {building.state}
                      </title>
                    </rect>
                  </g>
                );
              })}

              {visibleEvents.map((event) => {
                const { x, y } = projectLatLng(event.lat, event.lng, MAP_W, MAP_H);
                const r = eventRadius(event.hailSizeIn);
                const color = SEVERITY_COLOR[event.severity];
                const isSelected = event.id === selectedEventId;
                return (
                  <g key={event.id}>
                    {event.severity === "severe" && (
                      <circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        opacity="0.5"
                      >
                        <animate
                          attributeName="r"
                          from={r}
                          to={r * 2.2}
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.5"
                          to="0"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill={color}
                      fillOpacity={isSelected ? 0.85 : 0.55}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setSelectedBuildingId(null);
                      }}
                    >
                      <title>
                        {event.city}, {event.state} — {event.hailSizeIn}″ hail on{" "}
                        {dateFmt.format(new Date(event.date))}
                      </title>
                    </circle>
                  </g>
                );
              })}
            </svg>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              <span className="font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                Legend
              </span>
              {(Object.keys(SEVERITY_LABEL) as Severity[]).map((sev) => (
                <span key={sev} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLOR[sev] }}
                  />
                  {SEVERITY_LABEL[sev]}
                </span>
              ))}
              {(Object.keys(RISK_LABEL) as Array<keyof typeof RISK_LABEL>).map(
                (risk) => (
                  <span key={risk} className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: RISK_FILL[risk] }}
                    />
                    {RISK_LABEL[risk]}
                  </span>
                ),
              )}
            </div>
          </div>

          <aside
            aria-live="polite"
            aria-label="Selection details"
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {selectedEvent ? (
              <EventDetail
                event={selectedEvent}
                affectedBuildings={affectedBuildingsForEvent}
                onClear={() => setSelectedEventId(null)}
                onPickBuilding={(id) => {
                  setSelectedBuildingId(id);
                  setSelectedEventId(null);
                }}
              />
            ) : selectedBuilding ? (
              <BuildingDetail
                building={selectedBuilding}
                events={eventsForBuilding}
                onClear={() => setSelectedBuildingId(null)}
                onPickEvent={(id) => {
                  setSelectedEventId(id);
                  setSelectedBuildingId(null);
                }}
              />
            ) : (
              <EmptyDetail />
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
      <h3 className="text-base font-semibold text-zinc-950 dark:text-white">
        Pick a marker
      </h3>
      <p>
        Tap a colored circle to inspect a hail event, or tap a square to see a
        commercial building&apos;s exposure history.
      </p>
      <ul className="mt-2 space-y-2 text-xs text-zinc-500 dark:text-zinc-500">
        <li>· Circle size scales with hail diameter.</li>
        <li>· Square color reflects roof-age risk.</li>
        <li>· Severe storms pulse on the map.</li>
      </ul>
    </div>
  );
}

function EventDetail({
  event,
  affectedBuildings,
  onClear,
  onPickBuilding,
}: {
  event: HailEvent;
  affectedBuildings: ReadonlyArray<CommercialBuilding>;
  onClear: () => void;
  onPickBuilding: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            Hail event
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
            {event.city}, {event.state}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {dateFmt.format(new Date(event.date))}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300">
        <Stat label="Hail size" value={`${event.hailSizeIn.toFixed(2)}″`} />
        <Stat label="Duration" value={`${event.durationMin} min`} />
        <Stat
          label="Severity"
          value={SEVERITY_LABEL[event.severity]}
          accent={SEVERITY_COLOR[event.severity]}
        />
        <Stat
          label="Buildings impacted"
          value={numberFmt.format(event.buildingsImpacted)}
        />
      </dl>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Tracked roofs in path
        </p>
        {affectedBuildings.length === 0 ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No commercial buildings in our portfolio sat in this storm&apos;s
            path.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {affectedBuildings.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => onPickBuilding(b.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                >
                  <span>
                    <span className="block font-medium text-zinc-950 dark:text-white">
                      {b.name}
                    </span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      {b.roofSystem} · {b.roofAgeYears} yr roof
                    </span>
                  </span>
                  <span aria-hidden className="text-zinc-400">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BuildingDetail({
  building,
  events,
  onClear,
  onPickEvent,
}: {
  building: CommercialBuilding;
  events: ReadonlyArray<HailEvent>;
  onClear: () => void;
  onPickEvent: (id: string) => void;
}) {
  const risk = buildingRisk(building.roofAgeYears);
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            Commercial building
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
            {building.name}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {building.address}, {building.city}, {building.state}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300">
        <Stat label="Use" value={building.type} />
        <Stat label="Roof system" value={building.roofSystem} />
        <Stat
          label="Roof age"
          value={`${building.roofAgeYears} yr`}
          accent={RISK_FILL[risk]}
        />
        <Stat
          label="Square feet"
          value={numberFmt.format(building.squareFeet)}
        />
        <Stat
          label="Last inspected"
          value={dateFmt.format(new Date(building.lastInspected))}
        />
        <Stat label="Risk profile" value={RISK_LABEL[risk]} />
      </dl>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Storm exposure history
        </p>
        {events.length === 0 ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No verified hail events have struck this address since tracking
            began.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onPickEvent(event.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                >
                  <span>
                    <span className="block font-medium text-zinc-950 dark:text-white">
                      {dateFmt.format(new Date(event.date))} · {event.hailSizeIn}″
                    </span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      {SEVERITY_LABEL[event.severity]}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLOR[event.severity] }}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd
        className="mt-0.5 text-sm font-medium capitalize text-zinc-950 dark:text-white"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
