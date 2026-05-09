import { describe, expect, it } from "vitest";
import { getGenerationSpeedTier } from "@/lib/clipstitchr/utils/getGenerationSpeedTier";

describe("getGenerationSpeedTier", () => {
  it("parses known speed tiers", () => {
    expect(getGenerationSpeedTier("creator")).toBe("creator");
    expect(getGenerationSpeedTier("pro")).toBe("pro");
    expect(getGenerationSpeedTier("studio")).toBe("studio");
  });

  it("defaults unknown values to the Studio capability ceiling", () => {
    expect(getGenerationSpeedTier("")).toBe("studio");
    expect(getGenerationSpeedTier("unknown")).toBe("studio");
  });
});
