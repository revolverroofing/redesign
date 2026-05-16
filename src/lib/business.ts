/**
 * Single source of truth for business data displayed across the site and in
 * JSON-LD structured data. Anything tagged REPLACE_BEFORE_SHIPPING is a
 * placeholder — searching the repo for that string will surface every spot
 * that needs real values before the site goes live.
 */

export const REPLACE_BEFORE_SHIPPING = "REPLACE_BEFORE_SHIPPING" as const;

export type Hours = {
  days: ReadonlyArray<"Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su">;
  opens: string;
  closes: string;
};

export type License = { state: string; number: string };

export type Certification = { name: string; since?: number };

export const business = {
  name: "Revolver Roofing",
  legalName: "Revolver Roofing LLC",
  url: "https://www.revolverroofing.example",
  email: "hello@revolverroofing.example",
  phoneE164: "+15555550123",
  phoneDisplay: "(555) 555-0123",
  foundingYear: 1998,

  address: {
    street: REPLACE_BEFORE_SHIPPING,
    locality: REPLACE_BEFORE_SHIPPING,
    region: "NJ",
    postalCode: REPLACE_BEFORE_SHIPPING,
    country: "US",
  },

  geo: { latitude: 40.3573, longitude: -74.6672 },

  serviceAreaSummary: "Tri-State area (NY · NJ · PA)",

  hours: [
    { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "07:00", closes: "18:00" },
    { days: ["Sa"], opens: "08:00", closes: "14:00" },
  ] as ReadonlyArray<Hours>,

  rating: { value: 4.9, count: 312 },

  licenses: [
    { state: "PA", number: "PA-1234" },
    { state: "NJ", number: "13VH-5678" },
  ] as ReadonlyArray<License>,

  insurance: {
    generalLiabilityCarrier: REPLACE_BEFORE_SHIPPING,
  },

  // Brand certifications. Default empty — only add an entry once you can
  // prove the certification, since these are trademarked claims.
  certifications: [] as ReadonlyArray<Certification>,

  warranty: { years: 25, scope: "workmanship" },

  /**
   * Commercial / GC procurement profile. Surfaced on /contractors,
   * the bid-invitation Service JSON-LD, and llms.txt.
   */
  commercial: {
    // NAICS 238160 = Roofing Contractors. CSI MasterFormat 07 50 00 =
    // Membrane Roofing. Both are standard codes used in commercial
    // procurement search filters.
    naicsCode: "238160",
    csiCode: "07 50 00",
    systems: [
      "TPO (60 mil & 80 mil)",
      "EPDM (mechanically attached & ballasted)",
      "Modified bitumen (cap sheet & SBS)",
      "Built-up roofing (BUR)",
      "PVC single-ply",
      "Metal standing-seam",
    ],
    capacity: {
      largestProjectSqFt: 480_000,
      activeCrews: 6,
      bondingLimit: { perProject: 100_000, aggregate: 300_000 },
    },
    references: [
      "Property managers, school districts, and municipal facilities",
      "Big-box retail, light industrial, and distribution centers",
      "Multi-family and HOA boards",
    ],
  },
} as const;

export type Business = typeof business;
