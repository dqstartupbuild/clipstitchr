export type UgcCreatorRateComparisonRow = {
  costPerDeliverable: number | null;
  costPerUsableClip: number | null;
  includedRevisionCount: number;
  label: string;
  priceDifferenceFromMedian: number | null;
  rawFootageIncluded: boolean;
  totalCost: number;
  usageMonths: number;
};
