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

interface UpsConfig {
  clientId: string;
  clientSecret: string;
  accountNumber: string;
  baseUrl?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const DEFAULT_BASE = "https://onlinetools.ups.com";

export class UpsProvider implements ShippingProvider {
  readonly carrier = "ups" as const;
  private token: CachedToken | null = null;

  constructor(private config: UpsConfig) {
    if (!config.clientId || !config.clientSecret || !config.accountNumber) {
      throw new Error(
        "UPS provider requires UPS_CLIENT_ID, UPS_CLIENT_SECRET, and UPS_ACCOUNT_NUMBER"
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
    const basic = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");
    const res = await fetch(`${this.baseUrl}/security/v1/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) {
      throw new CarrierError(
        `UPS OAuth failed: ${res.status} ${await res.text()}`,
        "ups",
        res.status
      );
    }
    const json = (await res.json()) as {
      access_token: string;
      expires_in: string | number;
    };
    const ttlSec = Number(json.expires_in) || 3600;
    this.token = {
      accessToken: json.access_token,
      expiresAt: Date.now() + ttlSec * 1000,
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
        transId: cryptoRandomId(),
        transactionSrc: "claude-shipping-connector",
      },
    });
    const body = await res.text();
    if (!res.ok) {
      throw new CarrierError(
        `UPS ${path} failed: ${res.status} ${body}`,
        "ups",
        res.status
      );
    }
    return body ? (JSON.parse(body) as T) : ({} as T);
  }

  async getRates(req: RateRequest): Promise<RateResponse> {
    const payload = {
      RateRequest: {
        Request: { TransactionReference: { CustomerContext: "Rating and Service" } },
        Shipment: {
          Shipper: addressToUps(req.shipper, this.config.accountNumber),
          ShipTo: addressToUps(req.recipient),
          ShipFrom: addressToUps(req.shipper),
          Service: req.serviceCode
            ? { Code: req.serviceCode }
            : undefined,
          NumOfPieces: String(req.packages.length),
          Package: req.packages.map(packageToUps),
        },
      },
    };
    const data = await this.request<UpsRateResponse>("/api/rating/v2403/Shop", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const rates = data.RateResponse?.RatedShipment ?? [];
    return {
      carrier: "ups",
      quotes: rates.map((r) => ({
        carrier: "ups",
        serviceCode: r.Service?.Code ?? "",
        serviceName: UPS_SERVICE_NAMES[r.Service?.Code ?? ""] ?? r.Service?.Code ?? "",
        totalCharges: {
          amount: Number(r.TotalCharges?.MonetaryValue ?? 0),
          currency: r.TotalCharges?.CurrencyCode ?? "USD",
        },
        transitDays: r.GuaranteedDelivery?.BusinessDaysInTransit
          ? Number(r.GuaranteedDelivery.BusinessDaysInTransit)
          : undefined,
        guaranteedDelivery: Boolean(r.GuaranteedDelivery),
      })),
    };
  }

  async createShipment(req: ShipRequest): Promise<ShipResponse> {
    const labelFormat = req.labelFormat ?? "PDF";
    const payload = {
      ShipmentRequest: {
        Request: { RequestOption: "nonvalidate" },
        Shipment: {
          Description: req.reference ?? "Shipment",
          Shipper: {
            ...addressToUps(req.shipper, this.config.accountNumber),
            ShipperNumber: this.config.accountNumber,
          },
          ShipTo: addressToUps(req.recipient),
          ShipFrom: addressToUps(req.shipper),
          PaymentInformation: {
            ShipmentCharge: {
              Type: "01",
              BillShipper: { AccountNumber: this.config.accountNumber },
            },
          },
          Service: { Code: req.serviceCode },
          Package: req.packages.map(packageToUps),
        },
        LabelSpecification: {
          LabelImageFormat: { Code: labelFormat === "ZPL" ? "ZPL" : labelFormat },
          LabelStockSize: { Height: "6", Width: "4" },
        },
      },
    };
    const data = await this.request<UpsShipResponse>(
      "/api/shipments/v2403/ship",
      { method: "POST", body: JSON.stringify(payload) }
    );
    const result = data.ShipmentResponse?.ShipmentResults;
    if (!result) {
      throw new CarrierError("UPS ship response missing ShipmentResults", "ups");
    }
    const packageResults = Array.isArray(result.PackageResults)
      ? result.PackageResults
      : result.PackageResults
        ? [result.PackageResults]
        : [];
    return {
      carrier: "ups",
      masterTrackingNumber: result.ShipmentIdentificationNumber,
      labels: packageResults.map((p) => ({
        trackingNumber: p.TrackingNumber,
        format: labelFormat,
        imageBase64: p.ShippingLabel?.GraphicImage ?? "",
      })),
      totalCharges: result.ShipmentCharges?.TotalCharges
        ? {
            amount: Number(result.ShipmentCharges.TotalCharges.MonetaryValue),
            currency: result.ShipmentCharges.TotalCharges.CurrencyCode,
          }
        : undefined,
    };
  }

  async track(trackingNumber: string): Promise<TrackResponse> {
    const data = await this.request<UpsTrackResponse>(
      `/api/track/v1/details/${encodeURIComponent(trackingNumber)}`,
      { method: "GET" }
    );
    const shipment = data.trackResponse?.shipment?.[0];
    const pkg = shipment?.package?.[0];
    const activities = pkg?.activity ?? [];
    const events = activities.map((a) => ({
      timestamp: `${a.date ?? ""}T${a.time ?? "000000"}`,
      status: a.status?.type ?? a.status?.code ?? "UNKNOWN",
      description: a.status?.description ?? "",
      location: [
        a.location?.address?.city,
        a.location?.address?.stateProvince,
        a.location?.address?.country,
      ]
        .filter(Boolean)
        .join(", ") || undefined,
    }));
    const latest = events[0];
    return {
      carrier: "ups",
      trackingNumber,
      status: latest?.status ?? "UNKNOWN",
      estimatedDelivery: pkg?.deliveryDate?.[0]?.date,
      events,
    };
  }

  async validateAddress(
    req: AddressValidationRequest
  ): Promise<AddressValidationResponse> {
    const a = req.address;
    const payload = {
      XAVRequest: {
        AddressKeyFormat: {
          AddressLine: a.street,
          PoliticalDivision2: a.city,
          PoliticalDivision1: a.stateCode,
          PostcodePrimaryLow: a.postalCode,
          CountryCode: a.countryCode,
        },
      },
    };
    const data = await this.request<UpsAddressResponse>(
      "/api/addressvalidation/v2/1?regionalrequestindicator=string&maximumcandidatelistsize=10",
      { method: "POST", body: JSON.stringify(payload) }
    );
    const xav = data.XAVResponse;
    const candidates = xav?.Candidate ?? [];
    const list = Array.isArray(candidates) ? candidates : [candidates];
    const normalized = list[0]
      ? upsCandidateToAddress(list[0], a.countryCode)
      : undefined;
    return {
      carrier: "ups",
      valid: Boolean(xav?.ValidAddressIndicator),
      classification: xav?.AddressClassification?.Code === "2"
        ? "residential"
        : xav?.AddressClassification?.Code === "1"
          ? "commercial"
          : "unknown",
      normalized,
      candidates: list
        .map((c) => upsCandidateToAddress(c, a.countryCode))
        .filter((x): x is Address => Boolean(x)),
    };
  }
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2, 14);
}

function addressToUps(a: Address, accountNumber?: string) {
  return {
    Name: a.company ?? a.name ?? "",
    AttentionName: a.name ?? a.company ?? "",
    Phone: a.phone ? { Number: a.phone } : undefined,
    EMailAddress: a.email,
    ShipperNumber: accountNumber,
    Address: {
      AddressLine: a.street,
      City: a.city,
      StateProvinceCode: a.stateCode,
      PostalCode: a.postalCode,
      CountryCode: a.countryCode,
      ResidentialAddressIndicator: a.residential ? "" : undefined,
    },
  };
}

function packageToUps(p: PackageInput) {
  const dims =
    p.length && p.width && p.height && p.dimensionUnit
      ? {
          Dimensions: {
            UnitOfMeasurement: { Code: p.dimensionUnit },
            Length: String(p.length),
            Width: String(p.width),
            Height: String(p.height),
          },
        }
      : {};
  return {
    PackagingType: { Code: "02" },
    PackageWeight: {
      UnitOfMeasurement: { Code: p.weightUnit },
      Weight: String(p.weight),
    },
    ...dims,
  };
}

function upsCandidateToAddress(
  c: UpsAddressCandidate,
  countryCode: string
): Address | undefined {
  const k = c.AddressKeyFormat;
  if (!k) return undefined;
  const street = Array.isArray(k.AddressLine)
    ? k.AddressLine
    : k.AddressLine
      ? [k.AddressLine]
      : [];
  return {
    street,
    city: k.PoliticalDivision2 ?? "",
    stateCode: k.PoliticalDivision1 ?? "",
    postalCode: [k.PostcodePrimaryLow, k.PostcodeExtendedLow]
      .filter(Boolean)
      .join("-"),
    countryCode: k.CountryCode ?? countryCode,
  };
}

const UPS_SERVICE_NAMES: Record<string, string> = {
  "01": "UPS Next Day Air",
  "02": "UPS 2nd Day Air",
  "03": "UPS Ground",
  "07": "UPS Worldwide Express",
  "08": "UPS Worldwide Expedited",
  "11": "UPS Standard",
  "12": "UPS 3 Day Select",
  "13": "UPS Next Day Air Saver",
  "14": "UPS Next Day Air Early",
  "54": "UPS Worldwide Express Plus",
  "59": "UPS 2nd Day Air A.M.",
  "65": "UPS Saver",
};

interface UpsRateResponse {
  RateResponse?: {
    RatedShipment?: Array<{
      Service?: { Code?: string };
      TotalCharges?: { MonetaryValue?: string; CurrencyCode?: string };
      GuaranteedDelivery?: { BusinessDaysInTransit?: string };
    }>;
  };
}

interface UpsShipResponse {
  ShipmentResponse?: {
    ShipmentResults?: {
      ShipmentIdentificationNumber: string;
      ShipmentCharges?: {
        TotalCharges?: { MonetaryValue: string; CurrencyCode: string };
      };
      PackageResults?:
        | UpsPackageResult
        | UpsPackageResult[];
    };
  };
}

interface UpsPackageResult {
  TrackingNumber: string;
  ShippingLabel?: { GraphicImage?: string };
}

interface UpsTrackResponse {
  trackResponse?: {
    shipment?: Array<{
      package?: Array<{
        activity?: Array<{
          date?: string;
          time?: string;
          status?: { type?: string; code?: string; description?: string };
          location?: { address?: { city?: string; stateProvince?: string; country?: string } };
        }>;
        deliveryDate?: Array<{ date?: string }>;
      }>;
    }>;
  };
}

interface UpsAddressCandidate {
  AddressKeyFormat?: {
    AddressLine?: string | string[];
    PoliticalDivision2?: string;
    PoliticalDivision1?: string;
    PostcodePrimaryLow?: string;
    PostcodeExtendedLow?: string;
    CountryCode?: string;
  };
}

interface UpsAddressResponse {
  XAVResponse?: {
    ValidAddressIndicator?: string;
    AddressClassification?: { Code?: string };
    Candidate?: UpsAddressCandidate | UpsAddressCandidate[];
  };
}
