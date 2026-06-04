import { describe, expect, it } from "vitest";
import { TEXT_OVERLAY_COLOR_OPTIONS } from "@/lib/clipstitchr/constants/textOverlayColorOptions";
import { resolveAutomationStitchrColor } from "@/lib/clipstitchr/utils/resolveAutomationStitchrColor";

describe("resolveAutomationStitchrColor", () => {
  it("resolves Any to a deterministic palette color for a run seed", () => {
    const selectedColor = resolveAutomationStitchrColor(
      "any",
      "owner_1:2026-06-01:stitchr:1:text",
    );

    expect(TEXT_OVERLAY_COLOR_OPTIONS).toContain(selectedColor);
    expect(
      resolveAutomationStitchrColor(
        "any",
        "owner_1:2026-06-01:stitchr:1:text",
      ),
    ).toBe(selectedColor);
  });

  it("keeps a selected color", () => {
    expect(resolveAutomationStitchrColor("#fde047", "owner_1:run")).toBe(
      "#fde047",
    );
  });
});
