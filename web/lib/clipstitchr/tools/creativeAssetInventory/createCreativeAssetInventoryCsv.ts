import { calculateCreativeAssetInventory } from "@/lib/clipstitchr/tools/creativeAssetInventory/calculateCreativeAssetInventory";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";
import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";

export function createCreativeAssetInventoryCsv(
  rows: readonly CreativeAssetInventoryRow[],
) {
  const gapActions = new Map(
    calculateCreativeAssetInventory(rows).gaps.map((gap) => [
      gap.assetType,
      gap.nextAction,
    ]),
  );

  return createCsvText([
    [
      "Asset type",
      "Ready",
      "Needs work",
      "Missing",
      "Rights unknown",
      "Next action",
    ],
    ...rows.map((row) => [
      row.assetType,
      String(row.ready),
      String(row.needsWork),
      String(row.missing),
      String(row.rightsUnknown),
      gapActions.get(row.assetType) ?? "Covered for this inventory",
    ]),
  ]);
}
