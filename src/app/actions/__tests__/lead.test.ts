import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "user-agent": "test-agent" }),
}));

const deliverLead = vi.fn();
vi.mock("@/lib/lead-delivery", () => ({
  deliverLead: (...args: unknown[]) => deliverLead(...args),
}));

import { submitLead } from "../lead";

const initial = { status: "idle" as const };

function makeForm(overrides: Record<string, string> = {}) {
  const defaults = {
    name: "Jane Customer",
    phone: "555-555-0123",
    email: "jane@example.com",
    address: "123 Elm St",
    serviceType: "residential",
    message: "Roof leaking near chimney",
    company: "",
  };
  const fd = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitLead", () => {
  beforeEach(() => {
    deliverLead.mockReset();
  });

  it("delivers a valid lead and returns success", async () => {
    deliverLead.mockResolvedValueOnce(undefined);
    const result = await submitLead(initial, makeForm());
    expect(result.status).toBe("success");
    expect(deliverLead).toHaveBeenCalledOnce();
    expect(deliverLead.mock.calls[0][0]).toMatchObject({
      name: "Jane Customer",
      email: "jane@example.com",
      serviceType: "residential",
      userAgent: "test-agent",
    });
  });

  it("returns field errors for invalid input", async () => {
    const result = await submitLead(
      initial,
      makeForm({ name: "", phone: "12", email: "not-an-email", serviceType: "" }),
    );
    expect(result.status).toBe("error");
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.phone).toBeDefined();
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.serviceType).toBeDefined();
    expect(deliverLead).not.toHaveBeenCalled();
  });

  it("silently swallows honeypot submissions", async () => {
    const result = await submitLead(initial, makeForm({ company: "bot" }));
    expect(result.status).toBe("success");
    expect(deliverLead).not.toHaveBeenCalled();
  });

  it("reports a friendly error if delivery fails", async () => {
    deliverLead.mockRejectedValueOnce(new Error("smtp down"));
    const result = await submitLead(initial, makeForm());
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/call us/i);
  });
});
