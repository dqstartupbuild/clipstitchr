import type { AppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostInput";

export const defaultAppUgcCostInput: AppUgcCostInput = {
  creatorCount: 2,
  feePerCreator: 500,
  clipsPerCreator: 6,
  editingHours: 10,
  editingHourlyRate: 50,
  revisionCount: 4,
  costPerRevision: 75,
  internalHours: 6,
  internalHourlyCost: 40,
  unusedFootagePercentage: 33,
  finishedVariantCount: 8,
  batchesPerMonth: 2,
};
