import { describe, expect, it } from "vitest";
import { getUgcDiscoveryHookOpener } from "@/lib/clipstitchr/server/getUgcDiscoveryHookOpener";

describe("getUgcDiscoveryHookOpener", () => {
  it("maps discovery template coordinates to their exact creator opener", () => {
    expect(getUgcDiscoveryHookOpener("UGD-001")).toBe("not me");
    expect(getUgcDiscoveryHookOpener("UGD-120")).toBe("hold on, so");
    expect(getUgcDiscoveryHookOpener("UGD-300")).toBe("I fear I assumed");
  });

  it("returns no opener for another template source", () => {
    expect(getUgcDiscoveryHookOpener("PB-001")).toBe("");
  });
});
