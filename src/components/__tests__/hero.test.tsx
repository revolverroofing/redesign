import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "../hero";

describe("Hero", () => {
  it("renders the headline and primary CTA", () => {
    render(<Hero />);

    expect(
      screen.getByRole("heading", { level: 1, name: /roofs that last/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get a free estimate/i }),
    ).toHaveAttribute("href", "#contact");
  });
});
