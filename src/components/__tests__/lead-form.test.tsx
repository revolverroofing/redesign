import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/lead", () => ({
  submitLead: vi.fn(async () => ({
    status: "success" as const,
    message: "Thanks — we'll be in touch.",
  })),
}));

import { LeadForm } from "../lead-form";

describe("LeadForm", () => {
  it("renders the required contact fields", () => {
    render(<LeadForm />);

    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/^phone$/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/what do you need/i)).toBeRequired();
    expect(
      screen.getByRole("button", { name: /request an estimate/i }),
    ).toBeInTheDocument();
  });

  it("shows a success state after the action returns success", async () => {
    const user = userEvent.setup();
    render(<LeadForm />);

    await user.type(screen.getByLabelText(/name/i), "Jane");
    await user.type(screen.getByLabelText(/^phone$/i), "5555550123");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.selectOptions(
      screen.getByLabelText(/what do you need/i),
      "residential",
    );
    await user.click(screen.getByRole("button", { name: /request an estimate/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/thanks/i);
  });
});
