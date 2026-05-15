/**
 * Content for /services/[slug] pages. Add or edit entries to publish more
 * service pages — `generateStaticParams` reads the keys at build time, so a
 * new entry produces a new prerendered route on the next build.
 */

export type ServiceContent = {
  slug: string;
  title: string;
  shortDescription: string;
  intro: string;
  highlights: ReadonlyArray<{ title: string; body: string }>;
  faqs?: ReadonlyArray<{ question: string; answer: string }>;
};

export const services: Record<string, ServiceContent> = {
  residential: {
    slug: "residential",
    title: "Residential Roofing",
    shortDescription:
      "Asphalt shingle, metal, and tile installations for single-family homes.",
    intro:
      "From a one-day re-shingle to a full tear-off and re-roof after storm damage, our residential crews handle the whole job in-house — quote, install, and warranty in one phone call.",
    highlights: [
      {
        title: "Materials",
        body: "GAF and Owens Corning architectural shingles, standing-seam metal, and synthetic tile. We'll match what's on your block.",
      },
      {
        title: "Timeline",
        body: "Most asphalt re-roofs are completed in one or two days. Tear-offs scheduled within two weeks of estimate.",
      },
      {
        title: "Warranty",
        body: "25-year workmanship warranty plus the manufacturer's material warranty — both transferable if you sell.",
      },
    ],
    faqs: [
      {
        question: "How long does a typical re-roof take?",
        answer:
          "For a single-family home with asphalt shingles, one to two days from tear-off to cleanup.",
      },
      {
        question: "Do you handle insurance claims?",
        answer:
          "Yes — we'll meet your adjuster on-site and document storm damage with our drone photography.",
      },
    ],
  },
  commercial: {
    slug: "commercial",
    title: "Commercial Roofing",
    shortDescription:
      "TPO, EPDM, and modified bitumen for low-slope commercial buildings.",
    intro:
      "Flat-roof systems for warehouses, retail strips, office parks, and multi-family buildings. Scheduled around tenant operations to minimize disruption.",
    highlights: [
      {
        title: "Systems",
        body: "60-mil TPO, EPDM rubber, modified bitumen cap sheets, and built-up roofing. We size insulation and membrane to your load and energy targets.",
      },
      {
        title: "Service hours",
        body: "Off-hours and weekend installs available so your tenants and customers aren't disrupted.",
      },
      {
        title: "Documentation",
        body: "Full photo and material documentation for property management and warranty claims.",
      },
    ],
  },
  repairs: {
    slug: "repairs",
    title: "Repairs & Maintenance",
    shortDescription:
      "Leak diagnostics, flashing, gutters, and annual inspections.",
    intro:
      "Most repair calls are scheduled within 48 hours. We don't do bait-and-switch — if a repair is the right call, we'll repair it; we'll only recommend a re-roof if the deck or membrane is past its life.",
    highlights: [
      {
        title: "Emergency tarp",
        body: "Active leak? We'll tarp the same day and schedule the permanent fix once weather allows.",
      },
      {
        title: "Annual inspection",
        body: "Spring and fall inspection program with photo report — catches small problems before they become claims.",
      },
      {
        title: "Honest pricing",
        body: "Flat-rate pricing for common repairs. Larger fixes quoted with line-item materials and labor.",
      },
    ],
  },
};

export type ServiceSlug = string;

export const serviceSlugs = Object.keys(services);
