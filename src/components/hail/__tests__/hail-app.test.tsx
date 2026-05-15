import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HailApp } from "../hail-app";
import { commercialBuildings, hailEvents } from "@/lib/hail-data";

describe("HailApp", () => {
  it("opens on the dashboard view with summary stats", () => {
    render(<HailApp />);

    expect(
      screen.getByRole("heading", { level: 1, name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/storms by month/i)).toBeInTheDocument();
    expect(
      screen.getByText(`${hailEvents.length} storms · ${commercialBuildings.length} roofs`),
    ).toBeInTheDocument();
  });

  it("switches to the map view via the sidebar tabs", async () => {
    const user = userEvent.setup();
    render(<HailApp />);

    await user.click(screen.getByRole("tab", { name: /map/i }));

    expect(
      screen.getByRole("img", { name: /map of texas/i }),
    ).toBeInTheDocument();
  });

  it("filters storms by severity through the sidebar", async () => {
    const user = userEvent.setup();
    render(<HailApp />);

    await user.click(screen.getByRole("tab", { name: /storms/i }));

    const severeRadio = screen.getByRole("radio", { name: /^severe$/i });
    await user.click(severeRadio);

    const severeCount = hailEvents.filter((e) => e.severity === "severe").length;
    const stormsHeader = screen
      .getByRole("heading", { level: 1, name: /storms/i })
      .closest("header");
    expect(stormsHeader).toHaveTextContent(`${severeCount} storms`);
  });

  it("loads building details into the inspector when a row is clicked", async () => {
    const user = userEvent.setup();
    render(<HailApp />);

    await user.click(screen.getByRole("tab", { name: /buildings/i }));
    const targetBuilding = commercialBuildings[0];
    await user.click(screen.getByText(targetBuilding.name));

    const inspector = screen.getByLabelText(/selection details/i);
    expect(
      within(inspector).getByRole("heading", { level: 3, name: targetBuilding.name }),
    ).toBeInTheDocument();
  });
});
