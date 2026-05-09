import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HailTracker } from "../hail-tracker";
import { commercialBuildings, hailEvents } from "@/lib/hail-data";

describe("HailTracker", () => {
  it("renders the map with every storm visible by default", () => {
    render(<HailTracker />);

    expect(
      screen.getByRole("heading", { level: 2, name: /tri-state hail map/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /map of the tri-state area/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /filter by hail severity/i }),
    ).toHaveTextContent(`Showing ${hailEvents.length} of ${hailEvents.length} storms`);
  });

  it("filters storms when a severity chip is selected", async () => {
    const user = userEvent.setup();
    render(<HailTracker />);

    await user.click(screen.getByRole("button", { name: /^severe$/i }));

    const severeCount = hailEvents.filter((event) => event.severity === "severe").length;
    expect(
      screen.getByRole("group", { name: /filter by hail severity/i }),
    ).toHaveTextContent(`Showing ${severeCount} of ${hailEvents.length} storms`);
  });

  it("shows building details when a building marker is clicked", async () => {
    const user = userEvent.setup();
    render(<HailTracker />);

    const targetBuilding = commercialBuildings[0];
    const buildingTitle = screen.getByText(
      `${targetBuilding.name} — ${targetBuilding.city}, ${targetBuilding.state}`,
    );
    const buildingMarker = buildingTitle.parentElement;
    expect(buildingMarker).not.toBeNull();
    await user.click(buildingMarker as Element);

    const detailsRegion = screen.getByLabelText(/selection details/i);
    expect(
      within(detailsRegion).getByRole("heading", {
        level: 3,
        name: targetBuilding.name,
      }),
    ).toBeInTheDocument();
    expect(
      within(detailsRegion).getByText(
        new RegExp(targetBuilding.address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    ).toBeInTheDocument();
  });
});
