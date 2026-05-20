import {
  Address,
  AddressValidationRequest,
  AddressValidationResponse,
  CarrierError,
  PackageInput,
  RateRequest,
  RateResponse,
  ShipRequest,
  ShipResponse,
  ShippingProvider,
  TrackResponse,
} from "./types";

interface FedexConfig {
  apiKey: string;
  apiSecret: string;
  accountNumber: string;
  baseUrl?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const DEFAULT_BASE = "https://apis.fedex.com";

export class FedexProvider implements ShippingProvider {
  readonly carrier = "fedex" as const;
  private token: CachedToken | null = null;

  constructor(private config: FedexConfig) {
    if (!config.apiKey || !config.apiSecret || !config.accountNumber) {
      throw new Error(
        "FedEx provider requires FEDEX_API_KEY, FEDEX_API_SECRET, and FEDEX_ACCOUNT_NUMBER"
      );
    }
  }

  private get baseUrl(): string {
    return this.config.baseUrl ?? DEFAULT_BASE;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 30_000) {
      return this.token.accessToken;
    }
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.apiKey,
      client_secret: this.config.apiSecret,
    });
    const res = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      throw new CarrierError(
        `FedEx OAuth failed: ${res.status} ${await res.text()}`,
        "fedex",
        res.status
      );
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.token = {
      accessToken: json.access_token,
      expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
    };
    return this.token.accessToken;
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-locale": "en_US",
      },
    });
    const body = await res.text();
    if (!res.ok) {
      throw new CarrierError(
        `FedEx ${path} failed: ${res.status} ${body}`,
        "fedex",
        res.status
      );
    }
    return body ? (JSON.parse(body) as T) : ({} as T);
  }

  async getRates(req: RateRequest): Promise<RateResponse> {
    const payload = {
      accountNumber: { value: this.config.accountNumber },
      requestedShipment: {
        shipper: { address: addressToFedex(req.shipper) },
        recipient: { address: addressToFedex(req.recipient) },
        pickupType: "USE_SCHEDULED_PICKUP",
        rateRequestType: ["ACCOUNT", "LIST"],
        serviceType: req.serviceCode,
        requestedPackageLineItems: req.packages.map(packageToFedex),
      },
    };
    const data = await this.request<FedexRateResponse>("/rate/v1/rates/quotes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const details = data.output?.rateReplyDetails ?? [];
    return {
      carrier: "fedex",
      quotes: details.map((d) => {
        const totals = d.ratedShipmentDetails ?? [];
        const total = totals[0]?.totalNetCharge ?? 0;
        const currency = totals[0]?.currency ?? "USD";
        return {
          carrier: "fedex" as const,
          serviceCode: d.serviceType ?? "",
          serviceName: d.serviceName ?? d.serviceType ?? "",
          totalCharges: { amount: Number(total), currency },
          transitDays: parseTransit(d.commit?.transitTime),
          guaranteedDelivery: Boolean(d.commit?.dateDetail?.dayCxsFormat),
        };
      }),
    };
  }

  async createShipment(req: ShipRequest): Promise<ShipResponse> {
    const labelFormat = req.labelFormat ?? "PDF";
    const payload = {
      labelResponseOptions: "LABEL",
      accountNumber: { value: this.config.accountNumber },
      requestedShipment: {
        shipper: {
          contact: contactFromAddress(req.shipper),
          address: addressToFedex(req.shipper),
        },
        recipients: [
          {
            contact: contactFromAddress(req.recipient),
            address: addressToFedex(req.recipient),
          },
        ],
        shipDatestamp: new Date().toISOString().slice(0, 10),
        serviceType: req.serviceCode,
        packagingType: "YOUR_PACKAGING",
        pickupType: "USE_SCHEDULED_PICKUP",
        shippingChargesPayment: {
          paymentType: "SENDER",
          payor: {
            responsibleParty: {
              accountNumber: { value: this.config.accountNumber },
            },
          },
        },
        labelSpecification: {
          imageType: labelFormat,
          labelStockType: labelFormat === "ZPL" ? "STOCK_4X6" : "PAPER_4X6",
        },
        requestedPackageLineItems: req.packages.map(packageToFedex),
        customerReferences: req.reference
          ? [{ customerReferenceType: "CUSTOMER_REFERENCE", value: req.reference }]
          : undefined,
      },
    };
    const data = await this.request<FedexShipResponse>(
      "/ship/v1/shipments",
      { method: "POST", body: JSON.stringify(payload) }
    );
    const output = data.output;
    const transactions = output?.transactionShipments ?? [];
    const first = transactions[0];
    if (!first) {
      throw new CarrierError("FedEx ship response missing transactionShipments", "fedex");
    }
    const pieces = first.pieceResponses ?? [];
    return {
      carrier: "fedex",
      masterTrackingNumber: first.masterTrackingNumber,
      labels: pieces.map((p) => ({
        trackingNumber: p.trackingNumber,
        format: labelFormat,
        imageBase64: p.packageDocuments?.[0]?.encodedLabel ?? "",
      })),
      totalCharges: first.shipmentRating?.shipmentRateDetails?.[0]
        ? {
            amount: Number(
              first.shipmentRating.shipmentRateDetails[0].totalNetCharge ?? 0
            ),
            currency:
              first.shipmentRating.shipmentRateDetails[0].currency ?? "USD",
          }
        : undefined,
    };
  }

  async track(trackingNumber: string): Promise<TrackResponse> {
    const payload = {
      includeDetailedScans: true,
      trackingInfo: [
        {
          trackingNumberInfo: { trackingNumber },
        },
      ],
    };
    const data = await this.request<FedexTrackResponse>(
      "/track/v1/trackingnumbers",
      { method: "POST", body: JSON.stringify(payload) }
    );
    const result = data.output?.completeTrackResults?.[0]?.trackResults?.[0];
    const events = (result?.scanEvents ?? []).map((e) => ({
      timestamp: e.date ?? "",
      status: e.eventType ?? "UNKNOWN",
      description: e.eventDescription ?? "",
      location: [
        e.scanLocation?.city,
        e.scanLocation?.stateOrProvinceCode,
        e.scanLocation?.countryCode,
      ]
        .filter(Boolean)
        .join(", ") || undefined,
    }));
    return {
      carrier: "fedex",
      trackingNumber,
      status:
        result?.latestStatusDetail?.code ??
        result?.latestStatusDetail?.statusByLocale ??
        "UNKNOWN",
      estimatedDelivery: result?.estimatedDeliveryTimeWindow?.window?.ends,
      events,
    };
  }

  async validateAddress(
    req: AddressValidationRequest
  ): Promise<AddressValidationResponse> {
    const a = req.address;
    const payload = {
      addressesToValidate: [
        {
          address: {
            streetLines: a.street,
            city: a.city,
            stateOrProvinceCode: a.stateCode,
            postalCode: a.postalCode,
            countryCode: a.countryCode,
          },
        },
      ],
    };
    const data = await this.request<FedexAddressResponse>(
      "/address/v1/addresses/resolve",
      { method: "POST", body: JSON.stringify(payload) }
    );
    const resolved = data.output?.resolvedAddresses?.[0];
    const classification = resolved?.classification?.toLowerCase();
    return {
      carrier: "fedex",
      valid: (resolved?.attributes?.Resolved ?? "false") === "true",
      classification:
        classification === "residential" || classification === "commercial"
          ? classification
          : "unknown",
      normalized: resolved
        ? {
            street: resolved.streetLinesToken ?? a.street,
            city: resolved.city ?? a.city,
            stateCode: resolved.stateOrProvinceCode ?? a.stateCode,
            postalCode: resolved.postalCode ?? a.postalCode,
            countryCode: resolved.countryCode ?? a.countryCode,
          }
        : undefined,
    };
  }
}

function parseTransit(transit?: string): number | undefined {
  if (!transit) return undefined;
  const m = transit.match(/(\d+)/);
  return m ? Number(m[1]) : undefined;
}

function addressToFedex(a: Address) {
  return {
    streetLines: a.street,
    city: a.city,
    stateOrProvinceCode: a.stateCode,
    postalCode: a.postalCode,
    countryCode: a.countryCode,
    residential: a.residential ?? false,
  };
}

function contactFromAddress(a: Address) {
  return {
    personName: a.name ?? a.company ?? "Customer",
    companyName: a.company,
    phoneNumber: a.phone ?? "0000000000",
    emailAddress: a.email,
  };
}

function packageToFedex(p: PackageInput) {
  const dims =
    p.length && p.width && p.height && p.dimensionUnit
      ? {
          dimensions: {
            length: p.length,
            width: p.width,
            height: p.height,
            units: p.dimensionUnit,
          },
        }
      : {};
  return {
    weight: { units: p.weightUnit, value: p.weight },
    declaredValue: p.declaredValue
      ? { amount: p.declaredValue.amount, currency: p.declaredValue.currency }
      : undefined,
    ...dims,
  };
}

interface FedexRateResponse {
  output?: {
    rateReplyDetails?: Array<{
      serviceType?: string;
      serviceName?: string;
      ratedShipmentDetails?: Array<{
        totalNetCharge?: number;
        currency?: string;
      }>;
      commit?: {
        transitTime?: string;
        dateDetail?: { dayCxsFormat?: string };
      };
    }>;
  };
}

interface FedexShipResponse {
  output?: {
    transactionShipments?: Array<{
      masterTrackingNumber: string;
      pieceResponses?: Array<{
        trackingNumber: string;
        packageDocuments?: Array<{ encodedLabel?: string }>;
      }>;
      shipmentRating?: {
        shipmentRateDetails?: Array<{
          totalNetCharge?: number;
          currency?: string;
        }>;
      };
    }>;
  };
}

interface FedexTrackResponse {
  output?: {
    completeTrackResults?: Array<{
      trackResults?: Array<{
        latestStatusDetail?: { code?: string; statusByLocale?: string };
        estimatedDeliveryTimeWindow?: { window?: { ends?: string } };
        scanEvents?: Array<{
          date?: string;
          eventType?: string;
          eventDescription?: string;
          scanLocation?: { city?: string; stateOrProvinceCode?: string; countryCode?: string };
        }>;
      }>;
    }>;
  };
}

interface FedexAddressResponse {
  output?: {
    resolvedAddresses?: Array<{
      streetLinesToken?: string[];
      city?: string;
      stateOrProvinceCode?: string;
      postalCode?: string;
      countryCode?: string;
      classification?: string;
      attributes?: { Resolved?: string };
    }>;
  };
}
