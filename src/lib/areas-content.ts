/**
 * Content for /areas/[slug] pages — service-area landing pages aimed at
 * long-tail local searches like "roofer in [town]". Add real towns/regions
 * here. The seeded entry covers the existing "Tri-State area" copy so the
 * route renders out of the box.
 */

export type AreaContent = {
  slug: string;
  name: string;
  blurb: string;
  responseTime: string;
  notableProjects?: ReadonlyArray<string>;
};

export const areas: Record<string, AreaContent> = {
  "tri-state": {
    slug: "tri-state",
    name: "Tri-State Area",
    blurb:
      "We serve homeowners and property managers across the New York / New Jersey / Pennsylvania tri-state corridor — from a single shingle to a full multi-family re-roof.",
    responseTime: "Same-week scheduling for estimates; 48 hours for active leaks.",
  },
};

export type AreaSlug = string;

export const areaSlugs = Object.keys(areas);
