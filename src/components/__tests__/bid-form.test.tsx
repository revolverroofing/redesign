import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/bid", () => ({
  submitBid: vi.fn(async () => ({
    status: "success" as const,
    message: "Thanks — our estimator will follow up.",
  })),
}));

import { BidForm } from "../bid-form";

describe("BidForm", () => {
  it("renders the GC-targeted required fields", () => {
    render(<BidForm />);
    expect(screen.getByLabelText(/^company$/i)).toBeRequired();
    expect(screen.getByLabelText(/your name/i)).toBeRequired();
    expect(screen.getByLabelText(/work email/i)).toBeRequired();
    expect(screen.getByLabelText(/work phone/i)).toBeRequired();
    expect(screen.getByLabelText(/project name/i)).toBeRequired();
    expect(screen.getByLabelText(/approx\. size/i)).toBeRequired();
    expect(screen.getByLabelText(/system type/i)).toBeRequired();
    expect(
      screen.getByRole("button", { name: /invite us to bid/i }),
    ).toBeInTheDocument();
  });
});
