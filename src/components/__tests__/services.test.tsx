import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Services } from "../services";

describe("Services", () => {
  it("lists residential, commercial, and repair offerings", () => {
    render(<Services />);

    for (const name of ["Residential Roofing", "Commercial Roofing", "Repairs & Maintenance"]) {
      expect(screen.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
  });
});
