import { FedexProvider } from "./fedex";
import { Carrier, ShippingProvider } from "./types";
import { UpsProvider } from "./ups";

export * from "./types";
export { UpsProvider } from "./ups";
export { FedexProvider } from "./fedex";

interface ProviderEnv {
  UPS_CLIENT_ID?: string;
  UPS_CLIENT_SECRET?: string;
  UPS_ACCOUNT_NUMBER?: string;
  UPS_BASE_URL?: string;
  FEDEX_API_KEY?: string;
  FEDEX_API_SECRET?: string;
  FEDEX_ACCOUNT_NUMBER?: string;
  FEDEX_BASE_URL?: string;
}

export function getProvider(
  carrier: Carrier,
  env: ProviderEnv = process.env as ProviderEnv
): ShippingProvider {
  if (carrier === "ups") {
    return new UpsProvider({
      clientId: env.UPS_CLIENT_ID ?? "",
      clientSecret: env.UPS_CLIENT_SECRET ?? "",
      accountNumber: env.UPS_ACCOUNT_NUMBER ?? "",
      baseUrl: env.UPS_BASE_URL,
    });
  }
  if (carrier === "fedex") {
    return new FedexProvider({
      apiKey: env.FEDEX_API_KEY ?? "",
      apiSecret: env.FEDEX_API_SECRET ?? "",
      accountNumber: env.FEDEX_ACCOUNT_NUMBER ?? "",
      baseUrl: env.FEDEX_BASE_URL,
    });
  }
  throw new Error(`Unknown carrier: ${carrier as string}`);
}

export function parseCarrier(value: unknown): Carrier {
  if (value === "ups" || value === "fedex") return value;
  throw new Error(`Invalid carrier "${String(value)}". Expected "ups" or "fedex".`);
}
