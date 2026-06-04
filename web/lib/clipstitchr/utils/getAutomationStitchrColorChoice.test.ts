import { describe, expect, it } from "vitest";
import { getAutomationStitchrColorChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrColorChoice";

describe("getAutomationStitchrColorChoice", () => {
  it("keeps Any", () => {
    expect(getAutomationStitchrColorChoice("any")).toBe("any");
  });

  it("normalizes supported CSS colors to hex", () => {
    expect(getAutomationStitchrColorChoice("#fff")).toBe("#ffffff");
    expect(getAutomationStitchrColorChoice("rgb(253, 224, 71)")).toBe(
      "#fde047",
    );
  });

  it("falls back for unsupported color values", () => {
    expect(getAutomationStitchrColorChoice("rgb(999, 0, 0)")).toBe("any");
    expect(getAutomationStitchrColorChoice("not-a-color")).toBe("any");
    expect(getAutomationStitchrColorChoice(null)).toBe("any");
  });
});
