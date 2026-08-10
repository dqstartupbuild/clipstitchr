import { describe, expect, it } from "vitest";
import { socialPublishingAnalyticsTimeRangeOptions } from "@/lib/clipstitchr/utils/socialPublishingAnalyticsTimeRangeOptions";

describe("socialPublishingAnalyticsTimeRangeOptions", () => {
  it("orders short ranges first and all time last", () => {
    expect(
      socialPublishingAnalyticsTimeRangeOptions.map((option) => option.value),
    ).toEqual([
      "last_24_hours",
      "last_7_days",
      "last_30_days",
      "last_90_days",
      "last_12_months",
      "all_time",
    ]);
  });
});
