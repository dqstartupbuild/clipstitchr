import { describe, expect, it } from "vitest";
import { formatPublishingMetricValue } from "@/lib/clipstitchr/publishing/client/formatPublishingMetricValue";

describe("formatPublishingMetricValue", () => {
  it("carries rounded seconds into the next minute", () => {
    expect(
      formatPublishingMetricValue({
        key: "watch-time",
        label: "Watch time",
        unit: "duration-seconds",
        value: 119.6,
      }),
    ).toBe("2m 0s");
  });
});
