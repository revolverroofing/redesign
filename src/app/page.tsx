import { CtaSection } from "@/components/cta-section";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { TrustStrip } from "@/components/trust-strip";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <TrustStrip />
      <CtaSection />
    </>
  );
}
