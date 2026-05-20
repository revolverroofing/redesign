import type { Metadata } from "next";
import { ShippingConsole } from "./shipping-console";

export const metadata: Metadata = {
  title: "Shipping console — Revolver Roofing",
  robots: { index: false, follow: false },
};

export default function ShippingPage() {
  return <ShippingConsole />;
}
