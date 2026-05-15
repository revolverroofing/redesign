import type { Metadata } from "next";
import { HailApp } from "@/components/hail/hail-app";

export const metadata: Metadata = {
  title: "Texas hail console — commercial roofs",
  description:
    "Interactive console for NOAA-verified hail reports across Texas, mapped to the commercial buildings we monitor.",
};

export default function HailPage() {
  return <HailApp />;
}
