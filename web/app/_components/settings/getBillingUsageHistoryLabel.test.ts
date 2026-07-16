import { describe, expect, it } from "vitest";
import { getBillingUsageHistoryLabel } from "@/app/_components/settings/getBillingUsageHistoryLabel";
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

describe("getBillingUsageHistoryLabel", () => {
  it("distinguishes a finished operation from its reservation", () => {
    expect(getBillingUsageHistoryLabel(entry)).toBe(
      "Background photo finished",
    );
    expect(
      getBillingUsageHistoryLabel({ ...entry, entryType: "reserve" }),
    ).toBe("Background photo held");
  });

  it("uses readable fallback labels for new operations", () => {
    expect(
      getBillingUsageHistoryLabel({
        ...entry,
        entryType: "release",
        operation: "future_operation",
      }),
    ).toBe("future operation returned");
  });
});
