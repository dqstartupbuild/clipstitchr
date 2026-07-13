export type AppAdCostPerCreativeResult = {
  additionalCreativeCount: number;
  appliedAdditionalCost: number;
  blendedCostPerCreative: number | null;
  currentCostPerCreative: number | null;
  currentCreativeCount: number;
  currentTotalCost: number;
  differenceVersusCurrentAverage: number | null;
  dollarChangePerCreative: number | null;
  hasReuseScenario: boolean;
  incrementalCostPerCreative: number | null;
  percentageChange: number | null;
  projectedCreativeCount: number;
  projectedTotalCost: number;
  referenceCostAtCurrentAverage: number | null;
};
