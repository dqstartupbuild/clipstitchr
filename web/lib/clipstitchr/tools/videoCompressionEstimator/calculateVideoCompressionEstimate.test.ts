import { describe, expect, it } from "vitest";
import { calculateVideoCompressionEstimate } from "@/lib/clipstitchr/tools/videoCompressionEstimator/calculateVideoCompressionEstimate";
import { defaultVideoCompressionEstimateInput } from "@/lib/clipstitchr/tools/videoCompressionEstimator/defaultVideoCompressionEstimateInput";

describe("calculateVideoCompressionEstimate", () => {
  it("exposes the bitrate formula, eight-percent range, reduction, and transfer time", () => {
    const result = calculateVideoCompressionEstimate(
      defaultVideoCompressionEstimateInput,
    );

    expect(result.estimatedBytes).toBe(15_480_000);
    expect(result.estimatedMinimumBytes).toBe(14_241_600);
    expect(result.estimatedMaximumBytes).toBeCloseTo(16_718_400, 5);
    expect(result.bytesPerMinute).toBe(30_960_000);
    expect(result.minimumReductionPercent).toBeCloseTo(65.17, 2);
    expect(result.maximumReductionPercent).toBeCloseTo(70.33, 2);
    expect(result.transferMinimumSeconds).toBeCloseTo(11.39, 2);
    expect(result.transferMaximumSeconds).toBeCloseTo(13.37, 2);
  });

  it("returns no reduction comparison without an original size", () => {
    const result = calculateVideoCompressionEstimate({
      ...defaultVideoCompressionEstimateInput,
      originalBytes: null,
    });

    expect(result.minimumReductionPercent).toBeNull();
    expect(result.maximumReductionPercent).toBeNull();
  });

  it("handles a zero upload speed without an infinite result", () => {
    const result = calculateVideoCompressionEstimate({
      ...defaultVideoCompressionEstimateInput,
      uploadMegabitsPerSecond: 0,
    });

    expect(result.transferMinimumSeconds).toBe(0);
    expect(result.transferMaximumSeconds).toBe(0);
  });
});
