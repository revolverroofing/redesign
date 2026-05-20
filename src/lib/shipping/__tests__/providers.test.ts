import { afterEach, describe, expect, it, vi } from "vitest";
import { FedexProvider } from "../fedex";
import { getProvider, parseCarrier } from "../index";
import { UpsProvider } from "../ups";

const upsCreds = {
  clientId: "test-id",
  clientSecret: "test-secret",
  accountNumber: "ACC123",
  baseUrl: "https://stub.ups.test",
};

const fedexCreds = {
  apiKey: "key",
  apiSecret: "secret",
  accountNumber: "ACC456",
  baseUrl: "https://stub.fedex.test",
};

const sampleAddress = {
  street: ["1 Main St"],
  city: "Springfield",
  stateCode: "IL",
  postalCode: "62701",
  countryCode: "US",
};

function mockFetch(responses: Array<{ ok?: boolean; status?: number; body: unknown }>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : String(input);
    calls.push({ url, init: init ?? {} });
    const next = responses.shift();
    if (!next) throw new Error(`Unexpected fetch to ${url}`);
    const body = typeof next.body === "string" ? next.body : JSON.stringify(next.body);
    return new Response(body, {
      status: next.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fn);
  return { fn, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseCarrier", () => {
  it("accepts ups and fedex", () => {
    expect(parseCarrier("ups")).toBe("ups");
    expect(parseCarrier("fedex")).toBe("fedex");
  });
  it("rejects anything else", () => {
    expect(() => parseCarrier("dhl")).toThrow(/Invalid carrier/);
    expect(() => parseCarrier(undefined)).toThrow(/Invalid carrier/);
  });
});

describe("getProvider", () => {
  it("returns a UpsProvider for ups", () => {
    const p = getProvider("ups", {
      UPS_CLIENT_ID: "a",
      UPS_CLIENT_SECRET: "b",
      UPS_ACCOUNT_NUMBER: "c",
    });
    expect(p.carrier).toBe("ups");
  });
  it("throws when ups credentials are missing", () => {
    expect(() => getProvider("ups", {})).toThrow(/UPS_CLIENT_ID/);
  });
  it("throws when fedex credentials are missing", () => {
    expect(() => getProvider("fedex", {})).toThrow(/FEDEX_API_KEY/);
  });
});

describe("UpsProvider", () => {
  it("fetches an OAuth token then calls the tracking endpoint", async () => {
    const { calls } = mockFetch([
      { body: { access_token: "tok", expires_in: 3600 } },
      {
        body: {
          trackResponse: {
            shipment: [
              {
                package: [
                  {
                    activity: [
                      {
                        date: "20260518",
                        time: "120000",
                        status: { type: "I", description: "In transit" },
                        location: {
                          address: { city: "Louisville", stateProvince: "KY", country: "US" },
                        },
                      },
                    ],
                    deliveryDate: [{ date: "20260520" }],
                  },
                ],
              },
            ],
          },
        },
      },
    ]);
    const ups = new UpsProvider(upsCreds);
    const result = await ups.track("1Z999AA10123456784");
    expect(result.trackingNumber).toBe("1Z999AA10123456784");
    expect(result.status).toBe("I");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].location).toBe("Louisville, KY, US");
    expect(calls[0].url).toBe("https://stub.ups.test/security/v1/oauth/token");
    expect(calls[1].url).toContain("/api/track/v1/details/1Z999AA10123456784");
    expect((calls[1].init.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok"
    );
  });

  it("reuses cached tokens across calls", async () => {
    const { fn } = mockFetch([
      { body: { access_token: "tok", expires_in: 3600 } },
      { body: { trackResponse: { shipment: [{ package: [{ activity: [] }] }] } } },
      { body: { trackResponse: { shipment: [{ package: [{ activity: [] }] }] } } },
    ]);
    const ups = new UpsProvider(upsCreds);
    await ups.track("A");
    await ups.track("B");
    expect(fn).toHaveBeenCalledTimes(3); // 1 OAuth + 2 tracks
  });

  it("surfaces carrier errors with HTTP status", async () => {
    mockFetch([
      { body: { access_token: "tok", expires_in: 3600 } },
      { ok: false, status: 404, body: { error: "not found" } },
    ]);
    const ups = new UpsProvider(upsCreds);
    await expect(ups.track("BAD")).rejects.toMatchObject({
      name: "CarrierError",
      status: 404,
      carrier: "ups",
    });
  });
});

describe("FedexProvider", () => {
  it("validates an address via the resolve endpoint", async () => {
    const { calls } = mockFetch([
      { body: { access_token: "fxtok", expires_in: 3600 } },
      {
        body: {
          output: {
            resolvedAddresses: [
              {
                streetLinesToken: ["1 MAIN ST"],
                city: "SPRINGFIELD",
                stateOrProvinceCode: "IL",
                postalCode: "62701-1234",
                countryCode: "US",
                classification: "RESIDENTIAL",
                attributes: { Resolved: "true" },
              },
            ],
          },
        },
      },
    ]);
    const fedex = new FedexProvider(fedexCreds);
    const result = await fedex.validateAddress({ address: sampleAddress });
    expect(result.valid).toBe(true);
    expect(result.classification).toBe("residential");
    expect(result.normalized?.postalCode).toBe("62701-1234");
    expect(calls[1].url).toBe("https://stub.fedex.test/address/v1/addresses/resolve");
  });

  it("maps rate replies into normalized quotes", async () => {
    mockFetch([
      { body: { access_token: "fxtok", expires_in: 3600 } },
      {
        body: {
          output: {
            rateReplyDetails: [
              {
                serviceType: "FEDEX_GROUND",
                serviceName: "FedEx Ground",
                ratedShipmentDetails: [{ totalNetCharge: 12.34, currency: "USD" }],
                commit: { transitTime: "THREE_DAYS" },
              },
            ],
          },
        },
      },
    ]);
    const fedex = new FedexProvider(fedexCreds);
    const result = await fedex.getRates({
      shipper: sampleAddress,
      recipient: sampleAddress,
      packages: [{ weight: 3, weightUnit: "LB" }],
    });
    expect(result.carrier).toBe("fedex");
    expect(result.quotes).toHaveLength(1);
    expect(result.quotes[0].totalCharges).toEqual({ amount: 12.34, currency: "USD" });
    expect(result.quotes[0].serviceCode).toBe("FEDEX_GROUND");
  });
});
