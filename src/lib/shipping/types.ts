export type Carrier = "ups" | "fedex";

export interface Address {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  street: string[];
  city: string;
  stateCode: string;
  postalCode: string;
  countryCode: string;
  residential?: boolean;
}

export type WeightUnit = "LB" | "KG";
export type DimensionUnit = "IN" | "CM";

export interface PackageInput {
  weight: number;
  weightUnit: WeightUnit;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: DimensionUnit;
  declaredValue?: { amount: number; currency: string };
}

export interface RateRequest {
  shipper: Address;
  recipient: Address;
  packages: PackageInput[];
  serviceCode?: string;
}

export interface RateQuote {
  carrier: Carrier;
  serviceCode: string;
  serviceName: string;
  totalCharges: { amount: number; currency: string };
  transitDays?: number;
  guaranteedDelivery?: boolean;
}

export interface RateResponse {
  carrier: Carrier;
  quotes: RateQuote[];
}

export interface ShipRequest {
  shipper: Address;
  recipient: Address;
  packages: PackageInput[];
  serviceCode: string;
  labelFormat?: "PDF" | "PNG" | "ZPL";
  reference?: string;
}

export interface ShipmentLabel {
  trackingNumber: string;
  format: "PDF" | "PNG" | "ZPL";
  imageBase64: string;
}

export interface ShipResponse {
  carrier: Carrier;
  masterTrackingNumber: string;
  labels: ShipmentLabel[];
  totalCharges?: { amount: number; currency: string };
}

export interface TrackEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
}

export interface TrackResponse {
  carrier: Carrier;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  events: TrackEvent[];
}

export interface AddressValidationRequest {
  address: Address;
}

export interface AddressValidationResponse {
  carrier: Carrier;
  valid: boolean;
  classification?: "residential" | "commercial" | "unknown";
  normalized?: Address;
  candidates?: Address[];
  messages?: string[];
}

export interface ShippingProvider {
  readonly carrier: Carrier;
  getRates(req: RateRequest): Promise<RateResponse>;
  createShipment(req: ShipRequest): Promise<ShipResponse>;
  track(trackingNumber: string): Promise<TrackResponse>;
  validateAddress(req: AddressValidationRequest): Promise<AddressValidationResponse>;
}

export class CarrierError extends Error {
  constructor(
    message: string,
    public readonly carrier: Carrier,
    public readonly status?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "CarrierError";
  }
}
