import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BuildingsAtRisk } from "../buildings-at-risk";
import { commercialBuildings } from "@/lib/hail-data";

describe("BuildingsAtRisk", () => {
  it("lists every tracked commercial building in a sortable table", () => {
    render(<BuildingsAtRisk />);

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    // header + one row per building
    expect(rows).toHaveLength(commercialBuildings.length + 1);

    for (const building of commercialBuildings) {
      expect(within(table).getByText(building.name)).toBeInTheDocument();
    }
  });

  it("sorts high-risk buildings to the top", () => {
    render(<BuildingsAtRisk />);

    const dataRows = within(screen.getByRole("table"))
      .getAllByRole("row")
      .slice(1);
    const firstRow = dataRows[0];
    expect(within(firstRow).getByText(/high/i)).toBeInTheDocument();
  });
});
