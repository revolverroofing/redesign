import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "user-agent": "test-agent" }),
}));

const deliverBid = vi.fn();
vi.mock("@/lib/bid-delivery", () => ({
  deliverBid: (...args: unknown[]) => deliverBid(...args),
}));

import { submitBid } from "../bid";

const initial = { status: "idle" as const };

function makeForm(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    companyName: "Acme Construction",
    contactName: "Sam Estimator",
    contactEmail: "sam@acme.example",
    contactPhone: "555-555-9999",
    projectName: "Riverside Logistics Roof Replacement",
    projectLocation: "Trenton, NJ",
    projectSizeSqFt: "120000",
    systemType: "tpo",
    decisionDate: "2026-07-01",
    prevailingWage: "yes",
    drawingsLink: "https://drive.example/abc",
    notes: "Phased install, off-hours preferred",
    website: "",
  };
  const fd = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitBid", () => {
  beforeEach(() => {
    deliverBid.mockReset();
  });

  it("delivers a valid bid invitation", async () => {
    deliverBid.mockResolvedValueOnce(undefined);
    const result = await submitBid(initial, makeForm());
    expect(result.status).toBe("success");
    expect(deliverBid).toHaveBeenCalledOnce();
    expect(deliverBid.mock.calls[0][0]).toMatchObject({
      companyName: "Acme Construction",
      projectSizeSqFt: 120000,
      systemType: "tpo",
      prevailingWage: true,
      drawingsLink: "https://drive.example/abc",
    });
  });

  it("rejects bids with missing or malformed fields", async () => {
    const result = await submitBid(
      initial,
      makeForm({
        companyName: "",
        contactEmail: "not-an-email",
        projectSizeSqFt: "10",
        systemType: "",
        drawingsLink: "ftp://nope",
      }),
    );
    expect(result.status).toBe("error");
    expect(result.errors?.companyName).toBeDefined();
    expect(result.errors?.contactEmail).toBeDefined();
    expect(result.errors?.projectSizeSqFt).toBeDefined();
    expect(result.errors?.systemType).toBeDefined();
    expect(result.errors?.drawingsLink).toBeDefined();
    expect(deliverBid).not.toHaveBeenCalled();
  });

  it("silently swallows honeypot submissions", async () => {
    const result = await submitBid(initial, makeForm({ website: "spam-bait" }));
    expect(result.status).toBe("success");
    expect(deliverBid).not.toHaveBeenCalled();
  });

  it("normalizes square footage with commas/spaces", async () => {
    deliverBid.mockResolvedValueOnce(undefined);
    const result = await submitBid(initial, makeForm({ projectSizeSqFt: "120,000" }));
    expect(result.status).toBe("success");
    expect(deliverBid.mock.calls[0][0].projectSizeSqFt).toBe(120000);
  });
});
