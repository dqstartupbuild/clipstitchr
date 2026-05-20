import { describe, expect, it } from "vitest";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";

describe("getCssColorHex", () => {
  it("normalizes supported CSS color strings to hex", () => {
    expect(getCssColorHex(" #AABBcc ")).toBe("#AABBcc");
    expect(getCssColorHex("#abc")).toBe("#aabbcc");
    expect(getCssColorHex("rgb(1, 15, 255)")).toBe("#010fff");
    expect(getCssColorHex("rgba(16, 32, 48, 0.5)")).toBe("#102030");
  });

  it("returns the fallback for unsupported values", () => {
    expect(getCssColorHex("red", "#000000")).toBe("#000000");
  });
});
