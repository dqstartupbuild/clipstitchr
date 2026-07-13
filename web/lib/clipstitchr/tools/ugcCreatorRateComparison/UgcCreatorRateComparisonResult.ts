import type { UgcCreatorRateComparisonRow } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonRow";

export type UgcCreatorRateComparisonResult = {
  medianCostPerDeliverable: number | null;
  medianCostPerUsableClip: number | null;
  medianTotalCost: number | null;
  rows: UgcCreatorRateComparisonRow[];
};
