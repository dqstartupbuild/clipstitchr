import { describe, expect, it } from "vitest";
import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import { resolveAutomationStitchrTextStyleId } from "@/lib/clipstitchr/utils/resolveAutomationStitchrTextStyleId";

describe("resolveAutomationStitchrTextStyleId", () => {
  it("keeps a selected Stitchr automation style", () => {
    expect(resolveAutomationStitchrTextStyleId("neon", "run_1")).toBe("neon");
  });

  it("resolves Any to a deterministic palette style for a run seed", () => {
    const firstStyleId = resolveAutomationStitchrTextStyleId(
      "any",
      "owner_1:2026-06-01:stitchr:1",
    );
    const secondStyleId = resolveAutomationStitchrTextStyleId(
      "any",
      "owner_1:2026-06-02:stitchr:1",
    );

    expect(TEXT_OVERLAY_STYLES.map((style) => style.id)).toContain(firstStyleId);
    expect(TEXT_OVERLAY_STYLES.map((style) => style.id)).toContain(secondStyleId);
    expect(
      resolveAutomationStitchrTextStyleId(
        "any",
        "owner_1:2026-06-01:stitchr:1",
      ),
    ).toBe(firstStyleId);
  });
});
