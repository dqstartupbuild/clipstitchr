import { calculateCreativeAssetInventory } from "@/lib/clipstitchr/tools/creativeAssetInventory/calculateCreativeAssetInventory";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

export function createCreativeAssetInventoryMarkdown(
  rows: readonly CreativeAssetInventoryRow[],
) {
  const result = calculateCreativeAssetInventory(rows);
  const coverage =
    result.coveragePercent === null
      ? "Unavailable until at least one asset is counted"
      : `${result.coveragePercent.toFixed(1)}%`;

  return [
    "# App Creative Asset Inventory",
    "",
    `- Ready coverage: ${coverage}`,
    `- Total counted: ${result.total}`,
    `- Ready / needs work / missing / rights unknown: ${result.ready} / ${result.needsWork} / ${result.missing} / ${result.rightsUnknown}`,
    "",
    "## Inventory",
    ...rows.map(
      (row) =>
        `- ${row.assetType}: ${row.ready} ready, ${row.needsWork} needs work, ${row.missing} missing, ${row.rightsUnknown} rights unknown`,
    ),
    "",
    "## Prioritized captures and fixes",
    ...(result.gaps.length > 0
      ? result.gaps.map(
          (gap, index) =>
            `${index + 1}. **${gap.assetType}:** ${gap.nextAction}`,
        )
      : [
          "All counted assets are marked ready. Recheck the counts before production.",
        ]),
    "",
    "Rights-unknown assets are not counted as ready. This worksheet does not verify usage rights.",
  ].join("\n");
}
