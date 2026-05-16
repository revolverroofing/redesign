import { business } from "@/lib/business";

/**
 * Service schema with NAICS + CSI MasterFormat codes for commercial
 * procurement search. Renders inline on the /contractors page so
 * crawlers and AI procurement tools can match Revolver to the right
 * commercial roofing query without parsing prose.
 */
export function CommercialServiceSchema() {
  const bonding = business.commercial.capacity.bondingLimit;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${business.url}/contractors#service`,
    name: "Commercial Roofing — Bid Invitations",
    serviceType: "Commercial roofing installation, repair, and replacement",
    provider: { "@id": `${business.url}#business` },
    areaServed: business.serviceAreaSummary,
    audience: {
      "@type": "BusinessAudience",
      audienceType: "General Contractor",
    },
    category: [
      `NAICS ${business.commercial.naicsCode}`,
      `CSI MasterFormat ${business.commercial.csiCode}`,
    ],
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Bonding capacity, per project",
        value: bonding.perProject,
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Bonding capacity, aggregate",
        value: bonding.aggregate,
        unitCode: "USD",
      },
      {
        "@type": "PropertyValue",
        name: "Largest project completed",
        value: business.commercial.capacity.largestProjectSqFt,
        unitText: "sq ft",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Roofing systems",
      itemListElement: business.commercial.systems.map((systemName) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: systemName,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
