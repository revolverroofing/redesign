import { business, REPLACE_BEFORE_SHIPPING } from "@/lib/business";

function buildJsonLd() {
  const address = business.address;
  const hasRealAddress =
    address.street !== REPLACE_BEFORE_SHIPPING &&
    address.locality !== REPLACE_BEFORE_SHIPPING &&
    address.postalCode !== REPLACE_BEFORE_SHIPPING;

  return {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    "@id": `${business.url}#business`,
    name: business.name,
    legalName: business.legalName,
    url: business.url,
    telephone: business.phoneE164,
    email: business.email,
    foundingDate: String(business.foundingYear),
    areaServed: business.serviceAreaSummary,
    priceRange: "$$",
    ...(hasRealAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: address.street,
        addressLocality: address.locality,
        addressRegion: address.region,
        postalCode: address.postalCode,
        addressCountry: address.country,
      },
    }),
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    openingHoursSpecification: business.hours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: business.rating.value,
      reviewCount: business.rating.count,
    },
    ...(business.certifications.length > 0 && {
      hasCredential: business.certifications.map((cert) => ({
        "@type": "EducationalOccupationalCredential",
        name: cert.name,
        ...(cert.since && { dateCreated: String(cert.since) }),
      })),
    }),
    identifier: business.licenses.map((license) => ({
      "@type": "PropertyValue",
      propertyID: `${license.state} contractor license`,
      value: license.number,
    })),
  };
}

export function StructuredData() {
  const jsonLd = buildJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
