import type { UgcCreatorRateComparisonInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonInput";

export const defaultUgcCreatorRateComparisonInput: UgcCreatorRateComparisonInput =
  {
    quotes: [
      {
        addOnCost: 100,
        deliverableCount: 3,
        includedRevisionCount: 1,
        label: "Creator A",
        quotedPrice: 900,
        rawFootageIncluded: true,
        usableClipCount: 9,
        usageMonths: 3,
      },
      {
        addOnCost: 0,
        deliverableCount: 2,
        includedRevisionCount: 2,
        label: "Creator B",
        quotedPrice: 800,
        rawFootageIncluded: false,
        usableClipCount: 6,
        usageMonths: 6,
      },
      {
        addOnCost: 150,
        deliverableCount: 4,
        includedRevisionCount: 1,
        label: "Creator C",
        quotedPrice: 1_050,
        rawFootageIncluded: true,
        usableClipCount: 12,
        usageMonths: 3,
      },
    ],
  };
