import { describe, expect, it } from "vitest";
import {
  REGION_BOUNDS,
  commercialBuildings,
  hailEvents,
  projectLatLng,
  severityFromHailSize,
} from "@/lib/hail-data";

describe("hail-data", () => {
  it("classifies severity by hail diameter", () => {
    expect(severityFromHailSize(0.5)).toBe("minor");
    expect(severityFromHailSize(1.0)).toBe("moderate");
    expect(severityFromHailSize(1.74)).toBe("moderate");
    expect(severityFromHailSize(1.75)).toBe("severe");
    expect(severityFromHailSize(2.5)).toBe("severe");
  });

  it("places lat/lng inside the SVG viewport when within region bounds", () => {
    // Austin, TX
    const { x, y } = projectLatLng(30.2672, -97.7431, 800, 500);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(800);
    expect(y).toBeGreaterThan(0);
    expect(y).toBeLessThan(500);
  });

  it("keeps every seeded event within the region bounds", () => {
    for (const event of hailEvents) {
      expect(event.lat).toBeGreaterThanOrEqual(REGION_BOUNDS.south);
      expect(event.lat).toBeLessThanOrEqual(REGION_BOUNDS.north);
      expect(event.lng).toBeGreaterThanOrEqual(REGION_BOUNDS.west);
      expect(event.lng).toBeLessThanOrEqual(REGION_BOUNDS.east);
    }
  });

  it("links every building's affecting events to a real event", () => {
    const eventIds = new Set(hailEvents.map((event) => event.id));
    for (const building of commercialBuildings) {
      for (const id of building.affectingEventIds) {
        expect(eventIds.has(id)).toBe(true);
      }
    }
  });
});
