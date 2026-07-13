import { describe, expect, it } from "vitest";
import { calculateCreativeAssetInventory } from "@/lib/clipstitchr/tools/creativeAssetInventory/calculateCreativeAssetInventory";
import { createCreativeAssetInventoryCsv } from "@/lib/clipstitchr/tools/creativeAssetInventory/createCreativeAssetInventoryCsv";
import { createCreativeAssetInventoryMarkdown } from "@/lib/clipstitchr/tools/creativeAssetInventory/createCreativeAssetInventoryMarkdown";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

const rows: CreativeAssetInventoryRow[] = [
  {
    assetType: "UGC clips",
    captureAction: "Capture three clips.",
    id: "ugc",
    missing: 2,
    needsWork: 1,
    priority: 0,
    ready: 1,
    rightsUnknown: 0,
  },
  {
    assetType: "Product demos",
    captureAction: "Record a demo.",
    id: "demo",
    missing: 0,
    needsWork: 0,
    priority: 1,
    ready: 2,
    rightsUnknown: 1,
  },
];

describe("calculateCreativeAssetInventory", () => {
  it("calculates coverage and preserves rights uncertainty as a gap", () => {
    const result = calculateCreativeAssetInventory(rows);

    expect(result.total).toBe(7);
    expect(result.ready).toBe(3);
    expect(result.coveragePercent).toBeCloseTo(42.857, 2);
    expect(result.gaps[0]).toEqual({
      assetType: "UGC clips",
      nextAction: "Capture three clips.",
      severity: 10,
    });
    expect(result.gaps[1]?.nextAction).toContain("Confirm usage details");
  });

  it("returns an explicit unavailable coverage state for an empty inventory", () => {
    const empty = rows.map((row) => ({
      ...row,
      missing: 0,
      needsWork: 0,
      ready: 0,
      rightsUnknown: 0,
    }));

    expect(calculateCreativeAssetInventory(empty).coveragePercent).toBeNull();
  });

  it("exports the four-status inventory as CSV and a prioritized Markdown plan", () => {
    const csv = createCreativeAssetInventoryCsv(rows);
    const markdown = createCreativeAssetInventoryMarkdown(rows);

    expect(csv).toContain("Rights unknown");
    expect(csv).toContain("Capture three clips.");
    expect(markdown).toContain("Ready coverage: 42.9%");
    expect(markdown).toContain("Prioritized captures and fixes");
    expect(markdown).toContain("does not verify usage rights");
  });
});
