import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StructuredData } from "../structured-data";
import { business } from "@/lib/business";

describe("StructuredData", () => {
  it("emits a RoofingContractor JSON-LD payload sourced from business config", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const payload = JSON.parse(script!.innerHTML);
    expect(payload["@type"]).toBe("RoofingContractor");
    expect(payload.name).toBe(business.name);
    expect(payload.telephone).toBe(business.phoneE164);
    expect(payload.aggregateRating.ratingValue).toBe(business.rating.value);
  });

  it("escapes < to prevent XSS injection through string fields", () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script!.innerHTML).not.toMatch(/<\//);
  });
});
