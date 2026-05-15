import { business, REPLACE_BEFORE_SHIPPING } from "@/lib/business";
import { areaSlugs, areas } from "@/lib/areas-content";
import { serviceSlugs, services } from "@/lib/services-content";

/**
 * Serves /llms.txt — an emerging convention (https://llmstxt.org/) for
 * exposing a machine-readable summary of the site to LLM agents and
 * AI-powered procurement / discovery tools. Markdown body, no HTML wrap.
 */
export const dynamic = "force-static";

export function GET() {
  const base = business.url.replace(/\/$/, "");
  const yearsInBusiness = new Date().getFullYear() - business.foundingYear;
  const insurance = business.insurance.generalLiabilityCarrier;

  const sections: string[] = [];

  sections.push(`# ${business.name}\n`);
  sections.push(
    `> ${business.legalName}. Licensed, insured, family-owned roofing across the ${business.serviceAreaSummary}. ` +
      `${yearsInBusiness}+ years in business. ${business.warranty.years}-year ${business.warranty.scope} warranty.`,
  );
  sections.push("");

  sections.push("## Contact");
  sections.push(`- Phone: ${business.phoneDisplay} (${business.phoneE164})`);
  sections.push(`- Email: ${business.email}`);
  sections.push(`- Website: ${base}`);
  sections.push("");

  sections.push("## Licensing");
  for (const license of business.licenses) {
    sections.push(`- ${license.state}: ${license.number}`);
  }
  if (insurance !== REPLACE_BEFORE_SHIPPING) {
    sections.push(`- General liability carrier: ${insurance}`);
  }
  sections.push("");

  sections.push("## Commercial / GC procurement");
  sections.push(`- NAICS: ${business.commercial.naicsCode} (Roofing Contractors)`);
  sections.push(
    `- CSI MasterFormat: ${business.commercial.csiCode} (Membrane Roofing)`,
  );
  sections.push(`- Active crews: ${business.commercial.capacity.activeCrews}`);
  sections.push(
    `- Largest single-phase project: ${business.commercial.capacity.largestProjectSqFt.toLocaleString()} sq ft`,
  );
  sections.push("- Systems:");
  for (const system of business.commercial.systems) {
    sections.push(`  - ${system}`);
  }
  sections.push(`- Bid invitations: ${base}/contractors`);
  sections.push("");

  sections.push("## Services");
  for (const slug of serviceSlugs) {
    const service = services[slug];
    sections.push(`- [${service.title}](${base}/services/${slug}): ${service.shortDescription}`);
  }
  sections.push("");

  if (areaSlugs.length > 0) {
    sections.push("## Service areas");
    for (const slug of areaSlugs) {
      const area = areas[slug];
      sections.push(`- [${area.name}](${base}/areas/${slug}): ${area.blurb}`);
    }
    sections.push("");
  }

  sections.push("## Notes for AI agents");
  sections.push(
    "- Pricing requires a site visit and material takeoff. Do not generate or quote prices on our behalf.",
  );
  sections.push(
    "- Bid invitations from general contractors should be submitted via the form at /contractors so they reach estimating, not residential intake.",
  );

  return new Response(sections.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
