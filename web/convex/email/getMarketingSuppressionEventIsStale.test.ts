import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getMarketingSuppressionEventIsStale } from "./getMarketingSuppressionEventIsStale";

describe("marketing suppression event precedence", () => {
  it("always ends an equal-time bounce/complaint permutation complained", () => {
    const hardBounce = {
      suppressionChangedAt: 100,
      suppressionStatus: "hardBounce",
    } as Doc<"marketingContacts">;
    const complaint = {
      suppressionChangedAt: 100,
      suppressionStatus: "complaint",
    } as Doc<"marketingContacts">;

    expect(
      getMarketingSuppressionEventIsStale(
        complaint,
        100,
        "hardBounce",
      ),
    ).toBe(true);
    expect(
      getMarketingSuppressionEventIsStale(
        hardBounce,
        100,
        "complaint",
      ),
    ).toBe(false);
  });
});
