import type { Metadata } from "next";
import { CtaSection } from "@/components/cta-section";
import { BuildingsAtRisk } from "@/components/hail/buildings-at-risk";
import { HailEventTable } from "@/components/hail/hail-event-table";
import { HailHero } from "@/components/hail/hail-hero";
import { HailStats } from "@/components/hail/hail-stats";
import { HailTracker } from "@/components/hail/hail-tracker";

export const metadata: Metadata = {
  title: "Texas hail tracker — commercial roofs",
  description:
    "NOAA-verified hail reports across Texas, mapped to the commercial buildings we monitor.",
};

export default function HailPage() {
  return (
    <>
      <HailHero />
      <HailStats />
      <HailTracker />
      <BuildingsAtRisk />
      <HailEventTable />
      <CtaSection />
    </>
  );
}
