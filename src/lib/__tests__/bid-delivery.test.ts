import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverBid, type BidInvitation } from "../bid-delivery";

const sample: BidInvitation = {
  companyName: "Acme Construction",
  contactName: "Sam Estimator",
  contactEmail: "sam@acme.example",
  contactPhone: "5555559999",
  projectName: "Riverside Logistics",
  projectLocation: "Trenton, NJ",
  projectSizeSqFt: 120_000,
  systemType: "tpo",
  prevailingWage: true,
  submittedAt: "2026-05-15T05:00:00.000Z",
};

describe("deliverBid", () => {
  const originalEnv = process.env.BID_ZAPIER_HOOK_URL;
  const fetchSpy = vi.fn();

  beforeEach(() => {
    fetchSpy.mockReset();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    process.env.BID_ZAPIER_HOOK_URL = originalEnv;
    vi.unstubAllGlobals();
  });

  it("logs and returns without fetching when the hook URL is unset", async () => {
    delete process.env.BID_ZAPIER_HOOK_URL;
    await deliverBid(sample);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("POSTs JSON to the configured Zapier hook URL", async () => {
    process.env.BID_ZAPIER_HOOK_URL = "https://hooks.zapier.example/bid";
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await deliverBid(sample);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.zapier.example/bid");
    expect(JSON.parse(init.body)).toMatchObject({
      companyName: sample.companyName,
      projectSizeSqFt: sample.projectSizeSqFt,
    });
  });

  it("throws when the hook returns a non-2xx", async () => {
    process.env.BID_ZAPIER_HOOK_URL = "https://hooks.zapier.example/bid";
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 422 }));

    await expect(deliverBid(sample)).rejects.toThrow(/422/);
  });
});
