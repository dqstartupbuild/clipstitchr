export type AppUgcCostResult = {
  annualCost: number | null;
  costPerFinishedVariant: number | null;
  costPerRawClip: number | null;
  creatorCost: number;
  editingCost: number;
  estimatedUnusedFootageCost: number;
  finishedVariantCount: number;
  internalCost: number;
  monthlyCost: number | null;
  rawClipCount: number;
  revisionCost: number;
  totalBatchCost: number;
  unusedFootagePercentage: number;
};
