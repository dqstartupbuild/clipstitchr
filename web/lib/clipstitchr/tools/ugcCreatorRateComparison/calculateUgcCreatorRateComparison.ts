import { calculateMedian } from "@/lib/clipstitchr/tools/numbers/calculateMedian";
import { normalizeBoundedCount } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedCount";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";
import type { UgcCreatorRateComparisonInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonInput";
import type { UgcCreatorRateComparisonResult } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonResult";
import { ugcCreatorRateComparisonInputLimits } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/ugcCreatorRateComparisonInputLimits";

export function calculateUgcCreatorRateComparison(
  input: UgcCreatorRateComparisonInput,
): UgcCreatorRateComparisonResult {
  const normalizedRows = input.quotes
    .map((quote, index) => {
      const quotedPrice = normalizeBoundedDecimal(
        quote.quotedPrice,
        ugcCreatorRateComparisonInputLimits.money,
      );
      const addOnCost = normalizeBoundedDecimal(
        quote.addOnCost,
        ugcCreatorRateComparisonInputLimits.money,
      );
      const deliverableCount = normalizeBoundedCount(
        quote.deliverableCount,
        ugcCreatorRateComparisonInputLimits.count,
      );
      const usableClipCount = normalizeBoundedCount(
        quote.usableClipCount,
        ugcCreatorRateComparisonInputLimits.count,
      );
      const totalCost = quotedPrice + addOnCost;

      return {
        costPerDeliverable:
          deliverableCount === 0 ? null : totalCost / deliverableCount,
        costPerUsableClip:
          usableClipCount === 0 ? null : totalCost / usableClipCount,
        includedRevisionCount: normalizeBoundedCount(
          quote.includedRevisionCount,
          ugcCreatorRateComparisonInputLimits.count,
        ),
        label:
          quote.label
            .trim()
            .slice(0, ugcCreatorRateComparisonInputLimits.labelLength) ||
          `Quote ${index + 1}`,
        priceDifferenceFromMedian: null,
        rawFootageIncluded: Boolean(quote.rawFootageIncluded),
        totalCost,
        usageMonths: normalizeBoundedCount(
          quote.usageMonths,
          ugcCreatorRateComparisonInputLimits.usageMonths,
        ),
      };
    })
    .filter((row) => row.totalCost > 0);
  const medianTotalCost = calculateMedian(
    normalizedRows.map((row) => row.totalCost),
  );
  const rows = normalizedRows.map((row) => ({
    ...row,
    priceDifferenceFromMedian:
      medianTotalCost === null ? null : row.totalCost - medianTotalCost,
  }));

  return {
    medianCostPerDeliverable: calculateMedian(
      rows.flatMap((row) =>
        row.costPerDeliverable === null ? [] : [row.costPerDeliverable],
      ),
    ),
    medianCostPerUsableClip: calculateMedian(
      rows.flatMap((row) =>
        row.costPerUsableClip === null ? [] : [row.costPerUsableClip],
      ),
    ),
    medianTotalCost,
    rows,
  };
}
