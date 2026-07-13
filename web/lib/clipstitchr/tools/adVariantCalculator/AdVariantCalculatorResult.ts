import type { AdVariantTestPhase } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantTestPhase";

export type AdVariantCalculatorResult = {
  pairingCount: number;
  possibleCombinationCount: number;
  practicalFirstBatchCount: number;
  testPhases: AdVariantTestPhase[];
};
