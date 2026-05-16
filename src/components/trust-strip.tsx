import { business, REPLACE_BEFORE_SHIPPING } from "@/lib/business";

function buildPoints() {
  const yearsInBusiness = new Date().getFullYear() - business.foundingYear;

  const licenseDetail = business.licenses
    .map((license) => `${license.state} #${license.number}`)
    .join(" · ");

  const insurance = business.insurance.generalLiabilityCarrier;
  const insuranceDetail =
    insurance === REPLACE_BEFORE_SHIPPING
      ? "General liability and workers' comp on every job"
      : `Insured by ${insurance}`;

  const certificationDetail =
    business.certifications.length > 0
      ? business.certifications.map((cert) => cert.name).join(" · ")
      : null;

  return [
    { label: "Licensed", detail: licenseDetail },
    { label: "Insured", detail: insuranceDetail },
    {
      label: `${business.warranty.years}-year warranty`,
      detail: `On all ${business.warranty.scope}`,
    },
    certificationDetail
      ? { label: "Certified", detail: certificationDetail }
      : {
          label: `Family-owned since ${business.foundingYear}`,
          detail: `${yearsInBusiness}+ years in the ${business.serviceAreaSummary}`,
        },
  ];
}

export function TrustStrip() {
  const points = buildPoints();
  return (
    <section
      id="why-us"
      className="border-b border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <div key={point.label}>
            <div className="text-base font-semibold text-zinc-950 dark:text-white">
              {point.label}
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {point.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
