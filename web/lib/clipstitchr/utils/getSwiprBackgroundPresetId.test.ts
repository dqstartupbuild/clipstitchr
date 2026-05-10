import { describe, expect, it } from "vitest";
import { getSwiprBackgroundPresetId } from "@/lib/clipstitchr/utils/getSwiprBackgroundPresetId";

describe("getSwiprBackgroundPresetId", () => {
  it("returns known preset ids", () => {
    expect(getSwiprBackgroundPresetId("editorial")).toBe("editorial");
  });

  it("falls back to studio for unknown values", () => {
    expect(getSwiprBackgroundPresetId("unknown")).toBe("studio");
  });
});
