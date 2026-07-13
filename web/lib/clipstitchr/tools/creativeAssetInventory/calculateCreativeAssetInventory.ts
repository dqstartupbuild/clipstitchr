import type { CreativeAssetInventoryGap } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryGap";
import type { CreativeAssetInventoryResult } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryResult";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";

function safeCount(value: number) {
  return Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);
}

export function calculateCreativeAssetInventory(
  rows: readonly CreativeAssetInventoryRow[],
): CreativeAssetInventoryResult {
  let missing = 0;
  let needsWork = 0;
  let ready = 0;
  let rightsUnknown = 0;
  const gaps: Array<CreativeAssetInventoryGap & { priority: number }> = [];

  for (const row of rows) {
    const rowMissing = safeCount(row.missing);
    const rowNeedsWork = safeCount(row.needsWork);
    const rowReady = safeCount(row.ready);
    const rowRightsUnknown = safeCount(row.rightsUnknown);
    const severity = rowMissing * 4 + rowRightsUnknown * 3 + rowNeedsWork * 2;

    missing += rowMissing;
    needsWork += rowNeedsWork;
    ready += rowReady;
    rightsUnknown += rowRightsUnknown;

    if (severity > 0) {
      const nextAction =
        rowMissing > 0
          ? row.captureAction
          : rowRightsUnknown > 0
            ? `Confirm usage details for ${row.assetType.toLowerCase()} before production.`
            : `Review or recapture the ${row.assetType.toLowerCase()} marked as needs work.`;

      gaps.push({
        assetType: row.assetType,
        nextAction,
        priority: row.priority,
        severity,
      });
    }
  }

  const total = missing + needsWork + ready + rightsUnknown;

  return {
    coveragePercent: total > 0 ? (ready / total) * 100 : null,
    gaps: gaps
      .sort((left, right) =>
        right.severity === left.severity
          ? left.priority - right.priority
          : right.severity - left.severity,
      )
      .map((gap) => ({
        assetType: gap.assetType,
        nextAction: gap.nextAction,
        severity: gap.severity,
      })),
    missing,
    needsWork,
    ready,
    rightsUnknown,
    total,
  };
}
