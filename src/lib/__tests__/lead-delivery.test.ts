import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverLead, type Lead } from "../lead-delivery";

const sample: Lead = {
  name: "Jane Customer",
  phone: "5555550123",
  email: "jane@example.com",
  serviceType: "residential",
  submittedAt: "2026-05-15T05:00:00.000Z",
};

describe("deliverLead", () => {
  const originalEnv = process.env.LEAD_ZAPIER_HOOK_URL;
  const fetchSpy = vi.fn();

  beforeEach(() => {
    fetchSpy.mockReset();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    process.env.LEAD_ZAPIER_HOOK_URL = originalEnv;
    vi.unstubAllGlobals();
  });

  it("logs and returns without fetching when the hook URL is unset", async () => {
    delete process.env.LEAD_ZAPIER_HOOK_URL;
    await deliverLead(sample);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("POSTs JSON to the configured Zapier hook URL", async () => {
    process.env.LEAD_ZAPIER_HOOK_URL = "https://hooks.zapier.example/lead";
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await deliverLead(sample);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.zapier.example/lead");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "content-type": "application/json" });
    expect(JSON.parse(init.body)).toMatchObject({
      name: sample.name,
      email: sample.email,
    });
  });

  it("throws when the hook returns a non-2xx", async () => {
    process.env.LEAD_ZAPIER_HOOK_URL = "https://hooks.zapier.example/lead";
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(deliverLead(sample)).rejects.toThrow(/500/);
  });
});
