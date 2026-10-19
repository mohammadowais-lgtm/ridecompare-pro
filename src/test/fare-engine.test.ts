import { describe, expect, it } from "vitest";
import { computeFares, isNightMeter } from "@/lib/fare-engine";
import { buildDeepLink } from "@/lib/deep-link";

const trip = { km: 10, minutes: 27 };
const at = (h: number) => new Date(2026, 9, 19, h, 0, 0);

describe("Namma Yatri meter rules", () => {
  it("night meter window is 10 PM to 5 AM", () => {
    expect(isNightMeter(22)).toBe(true);
    expect(isNightMeter(4)).toBe(true);
    expect(isNightMeter(5)).toBe(false);
    expect(isNightMeter(21)).toBe(false);
  });

  it("auto has zero surge in the day", () => {
    const ny = computeFares(trip, "seed", at(14)).find((f) => f.id === "ny-auto")!;
    expect(ny.multiplier).toBe(1);
    expect(ny.pricing).toBe("meter");
  });

  it("auto charges 1.5x at night", () => {
    const ny = computeFares(trip, "seed", at(23)).find((f) => f.id === "ny-auto")!;
    expect(ny.multiplier).toBe(1.5);
    expect(ny.pricing).toBe("night");
  });

  it("offers four Namma Yatri tiers", () => {
    expect(computeFares(trip, "s").filter((f) => f.provider === "nammayatri")).toHaveLength(4);
  });

  it("continues in the Namma Yatri web app", () => {
    const ny = computeFares(trip, "s").find((f) => f.provider === "nammayatri")!;
    expect(buildDeepLink(ny, { lat: 1, lng: 1, name: "a" }, { lat: 2, lng: 2, name: "b" })).toBe("https://customer.nammayatri.in/");
  });
});
