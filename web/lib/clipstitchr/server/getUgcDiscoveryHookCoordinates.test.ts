import { describe, expect, it } from "vitest";
import { getUgcDiscoveryHookCoordinates } from "@/lib/clipstitchr/server/getUgcDiscoveryHookCoordinates";

describe("getUgcDiscoveryHookCoordinates", () => {
  it("identifies each discovery family, opener, and pattern position", () => {
    expect(getUgcDiscoveryHookCoordinates("UGD-001")).toEqual({
      familyIndex: 0,
      openerIndex: 0,
      patternIndex: 0,
    });
    expect(getUgcDiscoveryHookCoordinates("UGD-120")).toEqual({
      familyIndex: 1,
      openerIndex: 1,
      patternIndex: 9,
    });
    expect(getUgcDiscoveryHookCoordinates("UGD-300")).toEqual({
      familyIndex: 2,
      openerIndex: 9,
      patternIndex: 9,
    });
  });

  it("rejects IDs outside the UGC discovery library", () => {
    expect(getUgcDiscoveryHookCoordinates("MG-001")).toBeNull();
    expect(getUgcDiscoveryHookCoordinates("UGD-000")).toBeNull();
    expect(getUgcDiscoveryHookCoordinates("UGD-301")).toBeNull();
  });
});
