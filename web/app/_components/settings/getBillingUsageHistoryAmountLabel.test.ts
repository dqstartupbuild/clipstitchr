import { describe, expect, it } from "vitest";
import { getBillingUsageHistoryAmountLabel } from "@/app/_components/settings/getBillingUsageHistoryAmountLabel";
import type { BillingUsageHistoryEntry } from "@/app/_components/settings/types/BillingUsageHistoryEntry";

const entry: BillingUsageHistoryEntry = {
  availableDelta: 0,
  consumedDelta: 25,
  createdAt: "2026-07-16T06:44:15.827Z",
  entryType: "commit",
  operation: "background_photo",
  quantity: 25,
  reservedDelta: -25,
  resource: "creation_credit",
};

describe("getBillingUsageHistoryAmountLabel", () => {
  it("explains reservation lifecycle amounts without looking like two charges", () => {
    expect(getBillingUsageHistoryAmountLabel(entry)).toBe("25 used");
    expect(
      getBillingUsageHistoryAmountLabel({ ...entry, entryType: "reserve" }),
    ).toBe("25 held");
    expect(
      getBillingUsageHistoryAmountLabel({ ...entry, entryType: "release" }),
    ).toBe("25 returned");
  });

  it("keeps signed adjustments visible", () => {
    expect(
      getBillingUsageHistoryAmountLabel({
        ...entry,
        availableDelta: -2_001,
        consumedDelta: 0,
        entryType: "adjust",
        quantity: -2_001,
        reservedDelta: 0,
      }),
    ).toBe("-2,001");
  });
});
