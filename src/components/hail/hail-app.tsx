"use client";

import { useMemo, useState } from "react";
import {
  type BuildingType,
  type CommercialBuilding,
  type HailEvent,
  type RoofSystem,
  type Severity,
  REFERENCE_CITIES,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  TEXAS_OUTLINE,
  buildingsImpactedBy,
  commercialBuildings,
  eventsById,
  hailEvents,
  projectLatLng,
} from "@/lib/hail-data";

type View = "map" | "storms" | "buildings" | "dashboard";
type SeverityFilter = Severity | "all";
type BuildingTypeFilter = BuildingType | "all";

const ALL_BUILDING_TYPES: ReadonlyArray<BuildingType> = [
  "warehouse",
  "office",
  "retail",
  "industrial",
  "medical",
  "school",
];

const MIN_DATE = hailEvents.reduce(
  (min, e) => (e.date < min ? e.date : min),
  hailEvents[0].date,
);
const MAX_DATE = hailEvents.reduce(
  (max, e) => (e.date > max ? e.date : max),
  hailEvents[0].date,
);

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const monthFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const numberFmt = new Intl.NumberFormat("en-US");

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
  low: "Low",
  elevated: "Elevated",
  high: "High",
};

const RISK_BADGE: Record<ReturnType<typeof buildingRisk>, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  elevated:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const VIEW_TABS: ReadonlyArray<{
  value: View;
  label: string;
  icon: string;
}> = [
  { value: "dashboard", label: "Dashboard", icon: "M3 13h4v8H3v-8zm7-9h4v17h-4V4zm7 5h4v12h-4V9z" },
  { value: "map", label: "Map", icon: "M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zm0 0v15m6-12v15" },
  { value: "buildings", label: "Buildings", icon: "M3 21V7l9-4 9 4v14M3 21h18M9 11h.01M9 14h.01M9 17h.01M15 11h.01M15 14h.01M15 17h.01" },
  { value: "storms", label: "Storms", icon: "M6 16a4 4 0 0 1 .8-7.9 6 6 0 0 1 11.6 1.6 4 4 0 0 1-.4 7.9M11 20l-2 3M14 17l-2 3M16 13l-2 3" },
];

export function HailApp() {
  const [view, setView] = useState<View>("dashboard");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [buildingType, setBuildingType] = useState<BuildingTypeFilter>("all");
  const [dateStart, setDateStart] = useState<string>(MIN_DATE);
  const [dateEnd, setDateEnd] = useState<string>(MAX_DATE);
  const [search, setSearch] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );

  const normalizedSearch = search.trim().toLowerCase();

  const visibleEvents = useMemo<ReadonlyArray<HailEvent>>(() => {
    return hailEvents.filter((e) => {
      if (severity !== "all" && e.severity !== severity) return false;
      if (e.date < dateStart || e.date > dateEnd) return false;
      if (normalizedSearch) {
        const hay = `${e.city} ${e.county} ${e.state}`.toLowerCase();
        if (!hay.includes(normalizedSearch)) return false;
      }
      return true;
    });
  }, [severity, dateStart, dateEnd, normalizedSearch]);

  const visibleBuildings = useMemo<ReadonlyArray<CommercialBuilding>>(() => {
    return commercialBuildings.filter((b) => {
      if (buildingType !== "all" && b.type !== buildingType) return false;
      if (normalizedSearch) {
        const hay = `${b.name} ${b.city} ${b.state} ${b.address}`.toLowerCase();
        if (!hay.includes(normalizedSearch)) return false;
      }
      return true;
    });
  }, [buildingType, normalizedSearch]);

  const selectedEvent = useMemo(
    () => (selectedEventId ? eventsById().get(selectedEventId) : undefined),
    [selectedEventId],
  );
  const selectedBuilding = useMemo(() => {
    if (!selectedBuildingId) return undefined;
    return commercialBuildings.find((b) => b.id === selectedBuildingId);
  }, [selectedBuildingId]);

  function pickEvent(id: string | null) {
    setSelectedEventId(id);
    if (id) setSelectedBuildingId(null);
  }
  function pickBuilding(id: string | null) {
    setSelectedBuildingId(id);
    if (id) setSelectedEventId(null);
  }
  function clearSelection() {
    setSelectedEventId(null);
    setSelectedBuildingId(null);
  }

  const hasDetail = Boolean(selectedEvent || selectedBuilding);

  return (
    <div className="flex h-full min-h-[640px] flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <TopBar
        eventCount={visibleEvents.length}
        buildingCount={visibleBuildings.length}
        severeCount={visibleEvents.filter((e) => e.severity === "severe").length}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <Sidebar
          view={view}
          onViewChange={setView}
          severity={severity}
          onSeverityChange={setSeverity}
          buildingType={buildingType}
          onBuildingTypeChange={setBuildingType}
          dateStart={dateStart}
          onDateStartChange={setDateStart}
          dateEnd={dateEnd}
          onDateEndChange={setDateEnd}
          search={search}
          onSearchChange={setSearch}
        />

        <main className="min-w-0 overflow-y-auto bg-white dark:bg-zinc-950">
          {view === "dashboard" && (
            <DashboardView
              events={visibleEvents}
              buildings={visibleBuildings}
              onPickEvent={pickEvent}
              onPickBuilding={pickBuilding}
              onJumpTo={setView}
            />
          )}
          {view === "map" && (
            <MapView
              events={visibleEvents}
              buildings={visibleBuildings}
              selectedEventId={selectedEventId}
              selectedBuildingId={selectedBuildingId}
              onPickEvent={pickEvent}
              onPickBuilding={pickBuilding}
            />
          )}
          {view === "buildings" && (
            <BuildingsView
              buildings={visibleBuildings}
              selectedBuildingId={selectedBuildingId}
              onPickBuilding={pickBuilding}
            />
          )}
          {view === "storms" && (
            <StormsView
              events={visibleEvents}
              selectedEventId={selectedEventId}
              onPickEvent={pickEvent}
            />
          )}
        </main>

        <aside
          aria-live="polite"
          aria-label="Selection details"
          className={`border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${
            hasDetail ? "border-t lg:border-l lg:border-t-0" : "hidden xl:block xl:border-l"
          } overflow-y-auto`}
        >
          {selectedEvent ? (
            <EventDetail
              event={selectedEvent}
              onClear={clearSelection}
              onPickBuilding={pickBuilding}
            />
          ) : selectedBuilding ? (
            <BuildingDetail
              building={selectedBuilding}
              onClear={clearSelection}
              onPickEvent={pickEvent}
            />
          ) : (
            <EmptyDetail />
          )}
        </aside>
      </div>
    </div>
  );
}

function TopBar({
  eventCount,
  buildingCount,
  severeCount,
}: {
  eventCount: number;
  buildingCount: number;
  severeCount: number;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-600 text-white">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M6 16a4 4 0 0 1 .8-7.9 6 6 0 0 1 11.6 1.6 4 4 0 0 1-.4 7.9" />
          <path d="M11 20l-2 3M14 17l-2 3M16 13l-2 3" />
        </svg>
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight">
          Hail Console
        </span>
        <span className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Texas · NOAA Storm Events
        </span>
      </div>
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        <Pill label="Storms" value={eventCount} />
        <Pill label="Roofs" value={buildingCount} />
        <Pill label="Severe" value={severeCount} tone="red" />
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "red";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${toneClass}`}
    >
      <span className="text-[10px] uppercase tracking-wide opacity-80">
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}

function Sidebar({
  view,
  onViewChange,
  severity,
  onSeverityChange,
  buildingType,
  onBuildingTypeChange,
  dateStart,
  onDateStartChange,
  dateEnd,
  onDateEndChange,
  search,
  onSearchChange,
}: {
  view: View;
  onViewChange: (v: View) => void;
  severity: SeverityFilter;
  onSeverityChange: (s: SeverityFilter) => void;
  buildingType: BuildingTypeFilter;
  onBuildingTypeChange: (t: BuildingTypeFilter) => void;
  dateStart: string;
  onDateStartChange: (d: string) => void;
  dateEnd: string;
  onDateEndChange: (d: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  return (
    <nav
      aria-label="App navigation and filters"
      className="flex min-h-0 flex-col overflow-y-auto border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:border-r"
    >
      <ul role="tablist" className="grid grid-cols-4 gap-1 border-b border-zinc-200 p-2 lg:grid-cols-1 lg:gap-0.5 dark:border-zinc-800">
        {VIEW_TABS.map((tab) => {
          const isActive = view === tab.value;
          return (
            <li key={tab.value}>
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onViewChange(tab.value)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0"
                >
                  <path d={tab.icon} />
                </svg>
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-5 p-3">
        <FilterGroup label="Search">
          <div className="relative">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="City, county, building…"
              className="w-full rounded-md border border-zinc-300 bg-white py-1.5 pl-8 pr-2 text-sm placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </FilterGroup>

        <FilterGroup label="Severity">
          <RadioRow
            name="severity"
            value={severity}
            onChange={(v) => onSeverityChange(v as SeverityFilter)}
            options={[
              { value: "all", label: "All" },
              { value: "severe", label: "Severe", color: SEVERITY_COLOR.severe },
              { value: "moderate", label: "Moderate", color: SEVERITY_COLOR.moderate },
              { value: "minor", label: "Minor", color: SEVERITY_COLOR.minor },
            ]}
          />
        </FilterGroup>

        <FilterGroup label="Building type">
          <select
            value={buildingType}
            onChange={(event) =>
              onBuildingTypeChange(event.target.value as BuildingTypeFilter)
            }
            className="w-full rounded-md border border-zinc-300 bg-white py-1.5 px-2 text-sm capitalize focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All types</option>
            {ALL_BUILDING_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Date range">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateStart}
              min={MIN_DATE}
              max={dateEnd}
              onChange={(event) => onDateStartChange(event.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white py-1.5 px-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="date"
              value={dateEnd}
              min={dateStart}
              max={MAX_DATE}
              onChange={(event) => onDateEndChange(event.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white py-1.5 px-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onDateStartChange(MIN_DATE);
              onDateEndChange(MAX_DATE);
            }}
            className="mt-1.5 text-xs text-orange-700 hover:underline dark:text-orange-300"
          >
            Reset to full window
          </button>
        </FilterGroup>
      </div>

      <div className="mt-auto border-t border-zinc-200 px-3 py-3 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        Data:{" "}
        <a
          href="https://www.ncdc.noaa.gov/stormevents/"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          NOAA NCEI Storm Events
        </a>
      </div>
    </nav>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function RadioRow({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string; color?: string }>;
}) {
  return (
    <div className="flex flex-col gap-0.5" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {opt.color && (
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.label}
            </span>
            {isActive && (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ViewHeader({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta?: string;
}) {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      {meta ? (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{meta}</span>
      ) : null}
    </header>
  );
}

/* ----------- DASHBOARD ----------- */

function DashboardView({
  events,
  buildings,
  onPickEvent,
  onPickBuilding,
  onJumpTo,
}: {
  events: ReadonlyArray<HailEvent>;
  buildings: ReadonlyArray<CommercialBuilding>;
  onPickEvent: (id: string) => void;
  onPickBuilding: (id: string) => void;
  onJumpTo: (v: View) => void;
}) {
  const maxHail = events.reduce((m, e) => Math.max(m, e.hailSizeIn), 0);
  const severeCount = events.filter((e) => e.severity === "severe").length;
  const highRiskBuildings = buildings.filter(
    (b) => b.roofAgeYears >= 13,
  ).length;
  const impactedHits = events.reduce(
    (acc, e) => acc + buildingsImpactedBy(e.id),
    0,
  );

  return (
    <div className="flex flex-col">
      <ViewHeader
        title="Dashboard"
        subtitle="Operational summary across the active filters."
        meta={`${events.length} storms · ${buildings.length} roofs`}
      />

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="NOAA storms"
          value={events.length.toString()}
          sub={`${severeCount} severe`}
        />
        <StatCard
          label="Tracked roofs"
          value={buildings.length.toString()}
          sub={`${highRiskBuildings} high-risk (13+ yr)`}
        />
        <StatCard
          label="Storm × roof hits"
          value={numberFmt.format(impactedHits)}
          sub="Sum of building exposures"
        />
        <StatCard
          label="Largest hail"
          value={`${maxHail.toFixed(2)}″`}
          sub="Max reported diameter"
        />
      </div>

      <section className="px-6 py-2">
        <PanelHeading
          title="Storms by month"
          right={
            <button
              type="button"
              onClick={() => onJumpTo("storms")}
              className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-300"
            >
              See full storm log →
            </button>
          }
        />
        <MonthlyChart events={events} />
      </section>

      <section className="px-6 py-4">
        <PanelHeading
          title="Top exposed roofs"
          right={
            <button
              type="button"
              onClick={() => onJumpTo("buildings")}
              className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-300"
            >
              See all buildings →
            </button>
          }
        />
        <TopBuildings
          buildings={buildings}
          onPickBuilding={onPickBuilding}
        />
      </section>

      <section className="px-6 pb-6 pt-2">
        <PanelHeading
          title="Most severe storms"
          right={
            <button
              type="button"
              onClick={() => onJumpTo("map")}
              className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-300"
            >
              See on map →
            </button>
          }
        />
        <TopStorms events={events} onPickEvent={onPickEvent} />
      </section>
    </div>
  );
}

function PanelHeading({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {right}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>
    </div>
  );
}

function MonthlyChart({ events }: { events: ReadonlyArray<HailEvent> }) {
  const buckets = useMemo(() => {
    const map = new Map<
      string,
      { month: string; severe: number; moderate: number; minor: number }
    >();
    for (const e of events) {
      const key = e.date.slice(0, 7);
      const existing = map.get(key) ?? {
        month: key,
        severe: 0,
        moderate: 0,
        minor: 0,
      };
      existing[e.severity] += 1;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }, [events]);

  if (buckets.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No storms match the current filters.
      </p>
    );
  }

  const max = buckets.reduce(
    (m, b) => Math.max(m, b.severe + b.moderate + b.minor),
    1,
  );
  const colWidth = 36;
  const colGap = 12;
  const chartH = 140;
  const chartW = buckets.length * (colWidth + colGap);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <svg
        role="img"
        aria-label="Monthly storm counts by severity"
        viewBox={`0 0 ${chartW + 20} ${chartH + 32}`}
        width={chartW + 20}
        height={chartH + 32}
      >
        {buckets.map((b, i) => {
          const x = i * (colWidth + colGap) + colGap / 2;
          const total = b.severe + b.moderate + b.minor;
          const sevH = (b.severe / max) * chartH;
          const modH = (b.moderate / max) * chartH;
          const minH = (b.minor / max) * chartH;
          let cursor = chartH;
          return (
            <g key={b.month}>
              {b.minor > 0 && (
                <rect
                  x={x}
                  y={cursor - minH}
                  width={colWidth}
                  height={minH}
                  fill={SEVERITY_COLOR.minor}
                  rx="2"
                >
                  <title>{`${monthFmt.format(new Date(`${b.month}-01T00:00:00Z`))} · ${b.minor} minor`}</title>
                </rect>
              )}
              {(() => {
                cursor -= minH;
                return null;
              })()}
              {b.moderate > 0 && (
                <rect
                  x={x}
                  y={cursor - modH}
                  width={colWidth}
                  height={modH}
                  fill={SEVERITY_COLOR.moderate}
                  rx="2"
                >
                  <title>{`${monthFmt.format(new Date(`${b.month}-01T00:00:00Z`))} · ${b.moderate} moderate`}</title>
                </rect>
              )}
              {(() => {
                cursor -= modH;
                return null;
              })()}
              {b.severe > 0 && (
                <rect
                  x={x}
                  y={cursor - sevH}
                  width={colWidth}
                  height={sevH}
                  fill={SEVERITY_COLOR.severe}
                  rx="2"
                >
                  <title>{`${monthFmt.format(new Date(`${b.month}-01T00:00:00Z`))} · ${b.severe} severe`}</title>
                </rect>
              )}
              <text
                x={x + colWidth / 2}
                y={chartH + 14}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                className="fill-zinc-500"
              >
                {monthFmt.format(new Date(`${b.month}-01T00:00:00Z`))}
              </text>
              <text
                x={x + colWidth / 2}
                y={chartH + 26}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                className="fill-zinc-400"
              >
                {total}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {(["severe", "moderate", "minor"] as Severity[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: SEVERITY_COLOR[s] }}
            />
            {SEVERITY_LABEL[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopBuildings({
  buildings,
  onPickBuilding,
}: {
  buildings: ReadonlyArray<CommercialBuilding>;
  onPickBuilding: (id: string) => void;
}) {
  const ranked = useMemo(
    () =>
      [...buildings]
        .sort((a, b) => {
          const sevA = severeHits(a);
          const sevB = severeHits(b);
          if (sevA !== sevB) return sevB - sevA;
          return b.roofAgeYears - a.roofAgeYears;
        })
        .slice(0, 5),
    [buildings],
  );

  if (ranked.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No buildings match the current filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {ranked.map((b) => {
        const risk = buildingRisk(b.roofAgeYears);
        return (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onPickBuilding(b.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <span>
                <span className="block text-sm font-medium">{b.name}</span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {b.city}, {b.state} · {b.roofSystem} · {b.roofAgeYears} yr
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${RISK_BADGE[risk]}`}
              >
                {RISK_LABEL[risk]}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function severeHits(b: CommercialBuilding): number {
  const lookup = eventsById();
  return b.affectingEventIds
    .map((id) => lookup.get(id))
    .filter((event) => event?.severity === "severe").length;
}

function TopStorms({
  events,
  onPickEvent,
}: {
  events: ReadonlyArray<HailEvent>;
  onPickEvent: (id: string) => void;
}) {
  const top = useMemo(
    () => [...events].sort((a, b) => b.hailSizeIn - a.hailSizeIn).slice(0, 5),
    [events],
  );

  if (top.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No storms match the current filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {top.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onPickEvent(e.id)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          >
            <span>
              <span className="block text-sm font-medium">
                {e.city}, {e.state} · {e.hailSizeIn.toFixed(2)}″
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                {dateFmt.format(new Date(e.date))} · {e.county}
              </span>
            </span>
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: SEVERITY_COLOR[e.severity] }}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ----------- MAP ----------- */

const MAP_W = 880;
const MAP_H = 620;

function polygonPath(coords: ReadonlyArray<readonly [number, number]>) {
  return coords
    .map(([lat, lng], i) => {
      const { x, y } = projectLatLng(lat, lng, MAP_W, MAP_H);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .concat("Z")
    .join(" ");
}

function eventRadius(sizeIn: number) {
  return Math.min(26, Math.max(6, sizeIn * 6.5));
}

function MapView({
  events,
  buildings,
  selectedEventId,
  selectedBuildingId,
  onPickEvent,
  onPickBuilding,
}: {
  events: ReadonlyArray<HailEvent>;
  buildings: ReadonlyArray<CommercialBuilding>;
  selectedEventId: string | null;
  selectedBuildingId: string | null;
  onPickEvent: (id: string) => void;
  onPickBuilding: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <ViewHeader
        title="Map"
        subtitle="NOAA hail reports plotted against tracked Texas roofs."
        meta={`${events.length} storms · ${buildings.length} roofs`}
      />

      <div className="p-6">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <svg
            role="img"
            aria-label="Map of Texas showing recent hail events and tracked commercial buildings"
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="block h-auto w-full"
          >
            <defs>
              <linearGradient id="hail-app-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eef2f7" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <pattern
                id="hail-app-grid"
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

            <rect width={MAP_W} height={MAP_H} fill="url(#hail-app-bg)" />
            <rect width={MAP_W} height={MAP_H} fill="url(#hail-app-grid)" />

            <path
              d={polygonPath(TEXAS_OUTLINE)}
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="1.75"
              opacity="0.9"
            />
            <text
              x={MAP_W * 0.42}
              y={MAP_H * 0.55}
              fontSize="44"
              fontWeight="700"
              fill="#b45309"
              opacity="0.18"
              className="pointer-events-none select-none"
            >
              TEXAS
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

            {buildings.map((building) => {
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
                    onClick={() => onPickBuilding(building.id)}
                  >
                    <title>
                      {building.name} — {building.city}, {building.state}
                    </title>
                  </rect>
                </g>
              );
            })}

            {events.map((event) => {
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
                    onClick={() => onPickEvent(event.id)}
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

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-200 bg-white px-4 py-2 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Legend
            </span>
            {(Object.keys(SEVERITY_LABEL) as Severity[]).map((sev) => (
              <span key={sev} className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full"
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
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: RISK_FILL[risk] }}
                  />
                  Roof risk {RISK_LABEL[risk].toLowerCase()}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------- STORMS ----------- */

type StormSort =
  | "date-desc"
  | "date-asc"
  | "size-desc"
  | "size-asc"
  | "city-asc"
  | "city-desc";

function StormsView({
  events,
  selectedEventId,
  onPickEvent,
}: {
  events: ReadonlyArray<HailEvent>;
  selectedEventId: string | null;
  onPickEvent: (id: string) => void;
}) {
  const [sort, setSort] = useState<StormSort>("date-desc");

  const sorted = useMemo(() => {
    const arr = [...events];
    switch (sort) {
      case "date-asc":
        return arr.sort((a, b) => a.date.localeCompare(b.date));
      case "date-desc":
        return arr.sort((a, b) => b.date.localeCompare(a.date));
      case "size-asc":
        return arr.sort((a, b) => a.hailSizeIn - b.hailSizeIn);
      case "size-desc":
        return arr.sort((a, b) => b.hailSizeIn - a.hailSizeIn);
      case "city-asc":
        return arr.sort((a, b) => a.city.localeCompare(b.city));
      case "city-desc":
        return arr.sort((a, b) => b.city.localeCompare(a.city));
    }
  }, [events, sort]);

  return (
    <div className="flex flex-col">
      <ViewHeader
        title="Storms"
        subtitle="Every NOAA-verified hail event in the active filter set."
        meta={`${events.length} storms`}
      />

      <div className="px-6 py-5">
        {events.length === 0 ? (
          <EmptyState message="No storms match the current filters." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <SortableHeader
                    label="Date"
                    asc="date-asc"
                    desc="date-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                  <SortableHeader
                    label="Location"
                    asc="city-asc"
                    desc="city-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                  <th scope="col" className="px-4 py-3">County</th>
                  <th scope="col" className="px-4 py-3">Severity</th>
                  <SortableHeader
                    label="Hail size"
                    asc="size-asc"
                    desc="size-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                  <th scope="col" className="px-4 py-3">Reported by</th>
                  <th scope="col" className="px-4 py-3">Roofs hit</th>
                  <th scope="col" className="px-4 py-3">NOAA ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sorted.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => onPickEvent(event.id)}
                    className={`cursor-pointer text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/40 ${
                      event.id === selectedEventId
                        ? "bg-orange-50 dark:bg-orange-950/40"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-zinc-950 dark:text-white">
                      {dateFmt.format(new Date(event.date))}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {event.city}, {event.state}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {event.county}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLOR[event.severity] }}
                        />
                        <span className="capitalize">{event.severity}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">
                      {event.hailSizeIn.toFixed(2)}″
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {event.source}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {buildingsImpactedBy(event.id)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs text-zinc-500 dark:text-zinc-500">
                      #{event.noaaEventId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableHeader<T extends string>({
  label,
  asc,
  desc,
  sort,
  onSort,
}: {
  label: string;
  asc: T;
  desc: T;
  sort: T;
  onSort: (s: T) => void;
}) {
  const active = sort === asc ? "asc" : sort === desc ? "desc" : null;
  return (
    <th scope="col" className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(active === "desc" ? asc : desc)}
        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-zinc-900 dark:hover:text-white"
      >
        {label}
        <SortGlyph dir={active} />
      </button>
    </th>
  );
}

function SortGlyph({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="h-3 w-3 text-zinc-400"
    >
      <path
        d="M6 2 L9 5 H3 Z"
        fill={dir === "asc" ? "currentColor" : "rgba(0,0,0,0.18)"}
      />
      <path
        d="M6 10 L9 7 H3 Z"
        fill={dir === "desc" ? "currentColor" : "rgba(0,0,0,0.18)"}
      />
    </svg>
  );
}

/* ----------- BUILDINGS ----------- */

type BuildingSort =
  | "risk-desc"
  | "risk-asc"
  | "name-asc"
  | "name-desc"
  | "age-desc"
  | "age-asc"
  | "size-desc"
  | "size-asc";

function BuildingsView({
  buildings,
  selectedBuildingId,
  onPickBuilding,
}: {
  buildings: ReadonlyArray<CommercialBuilding>;
  selectedBuildingId: string | null;
  onPickBuilding: (id: string) => void;
}) {
  const [sort, setSort] = useState<BuildingSort>("risk-desc");

  const sorted = useMemo(() => {
    const score = (b: CommercialBuilding) => severeHits(b) * 100 + b.roofAgeYears;
    const arr = [...buildings];
    switch (sort) {
      case "risk-desc":
        return arr.sort((a, b) => score(b) - score(a));
      case "risk-asc":
        return arr.sort((a, b) => score(a) - score(b));
      case "name-asc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "age-desc":
        return arr.sort((a, b) => b.roofAgeYears - a.roofAgeYears);
      case "age-asc":
        return arr.sort((a, b) => a.roofAgeYears - b.roofAgeYears);
      case "size-desc":
        return arr.sort((a, b) => b.squareFeet - a.squareFeet);
      case "size-asc":
        return arr.sort((a, b) => a.squareFeet - b.squareFeet);
    }
  }, [buildings, sort]);

  return (
    <div className="flex flex-col">
      <ViewHeader
        title="Buildings"
        subtitle="Commercial roofs ranked by severe-storm exposure and roof age."
        meta={`${buildings.length} roofs`}
      />

      <div className="px-6 py-5">
        {buildings.length === 0 ? (
          <EmptyState message="No buildings match the current filters." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <SortableHeader
                    label="Building"
                    asc="name-asc"
                    desc="name-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                  <th scope="col" className="px-4 py-3">Location</th>
                  <th scope="col" className="px-4 py-3">Roof</th>
                  <SortableHeader
                    label="Age"
                    asc="age-asc"
                    desc="age-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                  <SortableHeader
                    label="Sq ft"
                    asc="size-asc"
                    desc="size-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                  <th scope="col" className="px-4 py-3">Storms hit</th>
                  <SortableHeader
                    label="Risk"
                    asc="risk-asc"
                    desc="risk-desc"
                    sort={sort}
                    onSort={setSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sorted.map((building) => {
                  const risk = buildingRisk(building.roofAgeYears);
                  return (
                    <tr
                      key={building.id}
                      onClick={() => onPickBuilding(building.id)}
                      className={`cursor-pointer text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/40 ${
                        building.id === selectedBuildingId
                          ? "bg-orange-50 dark:bg-orange-950/40"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-zinc-950 dark:text-white">
                          {building.name}
                        </div>
                        <div className="text-xs capitalize text-zinc-500 dark:text-zinc-500">
                          {building.type}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {building.city}, {building.state}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {building.roofSystem}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">
                        {building.roofAgeYears} yr
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">
                        {numberFmt.format(building.squareFeet)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {building.affectingEventIds.length}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${RISK_BADGE[risk]}`}
                        >
                          {RISK_LABEL[risk]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
      {message}
    </div>
  );
}

/* ----------- DETAIL PANEL ----------- */

function EmptyDetail() {
  return (
    <div className="flex h-full flex-col gap-3 p-5 text-sm text-zinc-600 dark:text-zinc-400">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        Inspector
      </h3>
      <p>
        Pick a storm or a building from any view to load its full record here —
        severity, affected roofs, NOAA narrative, and roof-system details.
      </p>
      <ul className="mt-2 space-y-2 text-xs text-zinc-500 dark:text-zinc-500">
        <li>· Map circles scale with hail diameter.</li>
        <li>· Square markers are color-coded by roof-age risk.</li>
        <li>· Severe storms pulse on the map.</li>
      </ul>
    </div>
  );
}

function EventDetail({
  event,
  onClear,
  onPickBuilding,
}: {
  event: HailEvent;
  onClear: () => void;
  onPickBuilding: (id: string) => void;
}) {
  const affected = useMemo(
    () =>
      commercialBuildings.filter((b) => b.affectingEventIds.includes(event.id)),
    [event.id],
  );

  return (
    <div className="flex flex-col gap-4 p-5 text-sm">
      <DetailHeader
        eyebrow="Hail event"
        title={`${event.city}, ${event.state}`}
        subtitle={`${event.county} · ${dateFmt.format(new Date(event.date))}`}
        onClear={onClear}
      />

      <dl className="grid grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300">
        <Stat label="Hail size" value={`${event.hailSizeIn.toFixed(2)}″`} />
        <Stat
          label="Severity"
          value={SEVERITY_LABEL[event.severity]}
          accent={SEVERITY_COLOR[event.severity]}
        />
        <Stat label="Reported by" value={event.source} />
        <Stat
          label="Tracked roofs hit"
          value={numberFmt.format(buildingsImpactedBy(event.id))}
        />
      </dl>

      {event.narrative ? (
        <blockquote className="rounded-lg border-l-4 border-orange-500 bg-zinc-50 px-3 py-2 text-xs italic text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          “{event.narrative}”
          <footer className="mt-1 not-italic text-zinc-500 dark:text-zinc-500">
            NOAA event #{event.noaaEventId} · episode #{event.noaaEpisodeId}
          </footer>
        </blockquote>
      ) : null}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Tracked roofs in path
        </p>
        {affected.length === 0 ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No commercial buildings in our portfolio sat in this storm&apos;s
            path.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {affected.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => onPickBuilding(b.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                >
                  <span>
                    <span className="block font-medium">{b.name}</span>
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
  onClear,
  onPickEvent,
}: {
  building: CommercialBuilding;
  onClear: () => void;
  onPickEvent: (id: string) => void;
}) {
  const risk = buildingRisk(building.roofAgeYears);
  const events = useMemo(() => {
    const lookup = eventsById();
    return building.affectingEventIds
      .map((id) => lookup.get(id))
      .filter((event): event is HailEvent => Boolean(event));
  }, [building.affectingEventIds]);

  return (
    <div className="flex flex-col gap-4 p-5 text-sm">
      <DetailHeader
        eyebrow="Commercial building"
        title={building.name}
        subtitle={`${building.address}, ${building.city}, ${building.state}`}
        onClear={onClear}
      />

      <dl className="grid grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300">
        <Stat label="Use" value={building.type} />
        <Stat label="Roof system" value={roofSystemLabel(building.roofSystem)} />
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
        <Stat label="Risk" value={RISK_LABEL[risk]} accent={RISK_FILL[risk]} />
      </dl>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Storm exposure history
        </p>
        {events.length === 0 ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No NOAA-verified hail events have struck within range of this
            address since tracking began.
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
                    <span className="block font-medium">
                      {dateFmt.format(new Date(event.date))} · {event.hailSizeIn.toFixed(2)}″
                    </span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                      {event.city}, {event.county} · {SEVERITY_LABEL[event.severity]}
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

function DetailHeader({
  eyebrow,
  title,
  subtitle,
  onClear,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Close
      </button>
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
      <dt className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd
        className="mt-0.5 text-sm font-medium capitalize"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

function roofSystemLabel(s: RoofSystem): string {
  return s;
}
