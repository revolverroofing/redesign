export type Severity = "minor" | "moderate" | "severe";

export type HailEvent = {
  id: string;
  date: string;
  city: string;
  state: "NJ" | "NY" | "PA";
  lat: number;
  lng: number;
  hailSizeIn: number;
  durationMin: number;
  severity: Severity;
  buildingsImpacted: number;
};

export type BuildingType =
  | "warehouse"
  | "office"
  | "retail"
  | "industrial"
  | "medical"
  | "school";

export type RoofSystem = "TPO" | "EPDM" | "Modified Bitumen" | "Metal" | "Built-Up";

export type CommercialBuilding = {
  id: string;
  name: string;
  type: BuildingType;
  address: string;
  city: string;
  state: "NJ" | "NY" | "PA";
  lat: number;
  lng: number;
  squareFeet: number;
  roofSystem: RoofSystem;
  roofAgeYears: number;
  lastInspected: string;
  affectingEventIds: string[];
};

export const REGION_BOUNDS = {
  west: -76.2,
  east: -73.3,
  south: 39.7,
  north: 41.3,
} as const;

export function projectLatLng(
  lat: number,
  lng: number,
  width: number,
  height: number,
) {
  const { west, east, south, north } = REGION_BOUNDS;
  const x = ((lng - west) / (east - west)) * width;
  const y = ((north - lat) / (north - south)) * height;
  return { x, y };
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  minor: "#38bdf8",
  moderate: "#f59e0b",
  severe: "#dc2626",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  minor: "Minor (< 1\")",
  moderate: "Moderate (1– 1.75\")",
  severe: "Severe (> 1.75\")",
};

export const REFERENCE_CITIES: ReadonlyArray<{
  name: string;
  state: "NJ" | "NY" | "PA";
  lat: number;
  lng: number;
}> = [
  { name: "Philadelphia", state: "PA", lat: 39.9526, lng: -75.1652 },
  { name: "Allentown", state: "PA", lat: 40.6084, lng: -75.4902 },
  { name: "Reading", state: "PA", lat: 40.3356, lng: -75.9269 },
  { name: "Trenton", state: "NJ", lat: 40.2206, lng: -74.7597 },
  { name: "Newark", state: "NJ", lat: 40.7357, lng: -74.1724 },
  { name: "Edison", state: "NJ", lat: 40.5187, lng: -74.4121 },
  { name: "Jersey City", state: "NJ", lat: 40.7178, lng: -74.0431 },
  { name: "Yonkers", state: "NY", lat: 40.9312, lng: -73.8987 },
  { name: "White Plains", state: "NY", lat: 41.034, lng: -73.7629 },
];

export const hailEvents: ReadonlyArray<HailEvent> = [
  {
    id: "evt-2025-09-14-allentown",
    date: "2025-09-14",
    city: "Allentown",
    state: "PA",
    lat: 40.6084,
    lng: -75.4902,
    hailSizeIn: 1.75,
    durationMin: 14,
    severity: "moderate",
    buildingsImpacted: 27,
  },
  {
    id: "evt-2025-10-02-edison",
    date: "2025-10-02",
    city: "Edison",
    state: "NJ",
    lat: 40.5187,
    lng: -74.4121,
    hailSizeIn: 0.75,
    durationMin: 8,
    severity: "minor",
    buildingsImpacted: 9,
  },
  {
    id: "evt-2025-11-19-newark",
    date: "2025-11-19",
    city: "Newark",
    state: "NJ",
    lat: 40.7357,
    lng: -74.1724,
    hailSizeIn: 2.25,
    durationMin: 22,
    severity: "severe",
    buildingsImpacted: 64,
  },
  {
    id: "evt-2025-12-08-trenton",
    date: "2025-12-08",
    city: "Trenton",
    state: "NJ",
    lat: 40.2206,
    lng: -74.7597,
    hailSizeIn: 1.25,
    durationMin: 11,
    severity: "moderate",
    buildingsImpacted: 18,
  },
  {
    id: "evt-2026-01-21-philadelphia",
    date: "2026-01-21",
    city: "Philadelphia",
    state: "PA",
    lat: 39.9526,
    lng: -75.1652,
    hailSizeIn: 2.0,
    durationMin: 18,
    severity: "severe",
    buildingsImpacted: 52,
  },
  {
    id: "evt-2026-02-04-white-plains",
    date: "2026-02-04",
    city: "White Plains",
    state: "NY",
    lat: 41.034,
    lng: -73.7629,
    hailSizeIn: 0.5,
    durationMin: 6,
    severity: "minor",
    buildingsImpacted: 4,
  },
  {
    id: "evt-2026-02-27-yonkers",
    date: "2026-02-27",
    city: "Yonkers",
    state: "NY",
    lat: 40.9312,
    lng: -73.8987,
    hailSizeIn: 1.5,
    durationMin: 12,
    severity: "moderate",
    buildingsImpacted: 21,
  },
  {
    id: "evt-2026-03-12-reading",
    date: "2026-03-12",
    city: "Reading",
    state: "PA",
    lat: 40.3356,
    lng: -75.9269,
    hailSizeIn: 1.1,
    durationMin: 9,
    severity: "moderate",
    buildingsImpacted: 14,
  },
  {
    id: "evt-2026-03-29-jersey-city",
    date: "2026-03-29",
    city: "Jersey City",
    state: "NJ",
    lat: 40.7178,
    lng: -74.0431,
    hailSizeIn: 2.5,
    durationMin: 24,
    severity: "severe",
    buildingsImpacted: 71,
  },
  {
    id: "evt-2026-04-09-bethlehem",
    date: "2026-04-09",
    city: "Bethlehem",
    state: "PA",
    lat: 40.6259,
    lng: -75.3705,
    hailSizeIn: 0.9,
    durationMin: 7,
    severity: "minor",
    buildingsImpacted: 6,
  },
  {
    id: "evt-2026-04-22-new-brunswick",
    date: "2026-04-22",
    city: "New Brunswick",
    state: "NJ",
    lat: 40.4862,
    lng: -74.4518,
    hailSizeIn: 1.6,
    durationMin: 13,
    severity: "moderate",
    buildingsImpacted: 23,
  },
  {
    id: "evt-2026-05-03-newark",
    date: "2026-05-03",
    city: "Newark",
    state: "NJ",
    lat: 40.7357,
    lng: -74.1724,
    hailSizeIn: 1.85,
    durationMin: 17,
    severity: "severe",
    buildingsImpacted: 38,
  },
];

export const commercialBuildings: ReadonlyArray<CommercialBuilding> = [
  {
    id: "bld-northport-logistics",
    name: "Northport Logistics Center",
    type: "warehouse",
    address: "1100 Doremus Ave",
    city: "Newark",
    state: "NJ",
    lat: 40.7012,
    lng: -74.1131,
    squareFeet: 184_000,
    roofSystem: "TPO",
    roofAgeYears: 6,
    lastInspected: "2026-02-14",
    affectingEventIds: ["evt-2025-11-19-newark", "evt-2026-05-03-newark"],
  },
  {
    id: "bld-meridian-tower",
    name: "Meridian Tower",
    type: "office",
    address: "200 Hudson St",
    city: "Jersey City",
    state: "NJ",
    lat: 40.7193,
    lng: -74.0454,
    squareFeet: 412_000,
    roofSystem: "Modified Bitumen",
    roofAgeYears: 12,
    lastInspected: "2026-04-02",
    affectingEventIds: ["evt-2026-03-29-jersey-city"],
  },
  {
    id: "bld-ironbound-flex",
    name: "Ironbound Flex Industrial",
    type: "industrial",
    address: "55 Wilson Ave",
    city: "Newark",
    state: "NJ",
    lat: 40.7245,
    lng: -74.1378,
    squareFeet: 96_500,
    roofSystem: "EPDM",
    roofAgeYears: 9,
    lastInspected: "2025-10-30",
    affectingEventIds: ["evt-2025-11-19-newark", "evt-2026-05-03-newark"],
  },
  {
    id: "bld-greenbrook-medical",
    name: "Greenbrook Medical Pavilion",
    type: "medical",
    address: "85 Centennial Ave",
    city: "Edison",
    state: "NJ",
    lat: 40.5234,
    lng: -74.4087,
    squareFeet: 58_000,
    roofSystem: "TPO",
    roofAgeYears: 4,
    lastInspected: "2026-01-18",
    affectingEventIds: ["evt-2025-10-02-edison"],
  },
  {
    id: "bld-statehouse-square",
    name: "Statehouse Square Retail",
    type: "retail",
    address: "12 W State St",
    city: "Trenton",
    state: "NJ",
    lat: 40.2197,
    lng: -74.7691,
    squareFeet: 41_200,
    roofSystem: "EPDM",
    roofAgeYears: 11,
    lastInspected: "2025-12-21",
    affectingEventIds: ["evt-2025-12-08-trenton"],
  },
  {
    id: "bld-raritan-distribution",
    name: "Raritan Distribution Hub",
    type: "warehouse",
    address: "300 Jersey Ave",
    city: "New Brunswick",
    state: "NJ",
    lat: 40.4839,
    lng: -74.4486,
    squareFeet: 220_000,
    roofSystem: "TPO",
    roofAgeYears: 7,
    lastInspected: "2026-03-04",
    affectingEventIds: ["evt-2026-04-22-new-brunswick"],
  },
  {
    id: "bld-lehigh-valley-park",
    name: "Lehigh Valley Industrial Park",
    type: "industrial",
    address: "7000 Industrial Blvd",
    city: "Allentown",
    state: "PA",
    lat: 40.6121,
    lng: -75.4837,
    squareFeet: 305_000,
    roofSystem: "Built-Up",
    roofAgeYears: 14,
    lastInspected: "2025-11-12",
    affectingEventIds: ["evt-2025-09-14-allentown", "evt-2026-04-09-bethlehem"],
  },
  {
    id: "bld-fairmount-school",
    name: "Fairmount Charter School",
    type: "school",
    address: "2400 Fairmount Ave",
    city: "Philadelphia",
    state: "PA",
    lat: 39.9651,
    lng: -75.1781,
    squareFeet: 64_000,
    roofSystem: "Modified Bitumen",
    roofAgeYears: 16,
    lastInspected: "2025-08-09",
    affectingEventIds: ["evt-2026-01-21-philadelphia"],
  },
  {
    id: "bld-schuylkill-office",
    name: "Schuylkill Riverfront Office",
    type: "office",
    address: "2600 S Christopher Columbus Blvd",
    city: "Philadelphia",
    state: "PA",
    lat: 39.9285,
    lng: -75.1438,
    squareFeet: 178_000,
    roofSystem: "TPO",
    roofAgeYears: 5,
    lastInspected: "2026-02-26",
    affectingEventIds: ["evt-2026-01-21-philadelphia"],
  },
  {
    id: "bld-westchester-corporate",
    name: "Westchester Corporate Center",
    type: "office",
    address: "1133 Westchester Ave",
    city: "White Plains",
    state: "NY",
    lat: 41.0387,
    lng: -73.7651,
    squareFeet: 142_000,
    roofSystem: "EPDM",
    roofAgeYears: 8,
    lastInspected: "2025-12-04",
    affectingEventIds: ["evt-2026-02-04-white-plains"],
  },
  {
    id: "bld-yonkers-marketplace",
    name: "Yonkers Marketplace",
    type: "retail",
    address: "100 Central Park Ave",
    city: "Yonkers",
    state: "NY",
    lat: 40.9356,
    lng: -73.8929,
    squareFeet: 88_400,
    roofSystem: "TPO",
    roofAgeYears: 10,
    lastInspected: "2026-03-15",
    affectingEventIds: ["evt-2026-02-27-yonkers"],
  },
  {
    id: "bld-reading-distribution",
    name: "Reading Distribution Annex",
    type: "warehouse",
    address: "500 Tuckerton Rd",
    city: "Reading",
    state: "PA",
    lat: 40.3389,
    lng: -75.9302,
    squareFeet: 156_000,
    roofSystem: "Metal",
    roofAgeYears: 18,
    lastInspected: "2025-09-27",
    affectingEventIds: ["evt-2026-03-12-reading"],
  },
];

export function eventsById() {
  return new Map(hailEvents.map((event) => [event.id, event]));
}

export function buildingsById() {
  return new Map(commercialBuildings.map((b) => [b.id, b]));
}

export function severityFromHailSize(sizeIn: number): Severity {
  if (sizeIn >= 1.75) return "severe";
  if (sizeIn >= 1) return "moderate";
  return "minor";
}
