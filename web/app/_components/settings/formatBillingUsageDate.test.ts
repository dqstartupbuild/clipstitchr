import { describe, expect, it } from "vitest";
import { formatBillingUsageDate } from "@/app/_components/settings/formatBillingUsageDate";

describe("formatBillingUsageDate", () => {
  it("formats a UTC billing date and keeps missing dates empty", () => {
    expect(formatBillingUsageDate("2027-07-16T23:59:59.000Z")).toBe(
      "Jul 16, 2027",
    );
    expect(formatBillingUsageDate()).toBeNull();
  });
});
