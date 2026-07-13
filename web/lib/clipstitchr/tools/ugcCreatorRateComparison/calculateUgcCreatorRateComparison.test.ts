import { describe, expect, it } from "vitest";
import { calculateUgcCreatorRateComparison } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/calculateUgcCreatorRateComparison";
import { defaultUgcCreatorRateComparisonInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/defaultUgcCreatorRateComparisonInput";

describe("calculateUgcCreatorRateComparison", () => {
  it("normalizes only the visitor-entered quotes", () => {
    const result = calculateUgcCreatorRateComparison(
      defaultUgcCreatorRateComparisonInput,
    );

    expect(result.medianTotalCost).toBe(1_000);
    expect(result.rows[0].costPerDeliverable).toBeCloseTo(333.3333);
    expect(result.rows[1].costPerUsableClip).toBeCloseTo(133.3333);
    expect(result.rows[2].priceDifferenceFromMedian).toBe(200);
  });

  it("omits empty quote slots and never supplies an outside benchmark", () => {
    const result = calculateUgcCreatorRateComparison({
      quotes: [
        {
          ...defaultUgcCreatorRateComparisonInput.quotes[0],
          quotedPrice: 0,
          addOnCost: 0,
        },
      ],
    });

    expect(result.rows).toEqual([]);
    expect(result.medianTotalCost).toBeNull();
  });
});
