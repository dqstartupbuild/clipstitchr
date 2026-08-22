import { describe, expect, it } from "vitest";
import { getStitchrNormalOutputPlans } from "@/lib/clipstitchr/utils/getStitchrNormalOutputPlans";

describe("getStitchrNormalOutputPlans", () => {
  it("creates one paired output for each UGC clip when a demo is selected", () => {
    expect(getStitchrNormalOutputPlans(["ugc-a", "ugc-b"], "demo-a")).toEqual([
      { sourceClipIds: ["ugc-a", "demo-a"] },
      { sourceClipIds: ["ugc-b", "demo-a"] },
    ]);
  });

  it("creates standalone outputs when only UGC clips are selected", () => {
    expect(getStitchrNormalOutputPlans(["ugc-a", "ugc-b"], null)).toEqual([
      { sourceClipIds: ["ugc-a"] },
      { sourceClipIds: ["ugc-b"] },
    ]);
  });

  it("creates one standalone output when only a demo is selected", () => {
    expect(getStitchrNormalOutputPlans([], "demo-a")).toEqual([
      { sourceClipIds: ["demo-a"] },
    ]);
  });

  it("does not create outputs without selected clips", () => {
    expect(getStitchrNormalOutputPlans([], null)).toEqual([]);
  });
});
