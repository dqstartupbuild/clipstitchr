import { describe, expect, it } from "vitest";
import { createSwaprSegmentTrimRanges } from "@/lib/clipstitchr/utils/createSwaprSegmentTrimRanges";

describe("createSwaprSegmentTrimRanges", () => {
  it("keeps short videos as one segment", () => {
    expect(createSwaprSegmentTrimRanges(9, 10)).toEqual([
      { start: 0, end: 9 },
    ]);
  });

  it("splits longer videos into balanced chunks under the segment limit", () => {
    const ranges = createSwaprSegmentTrimRanges(21, 10);

    expect(ranges).toHaveLength(3);
    expect(ranges[0]).toEqual({ start: 0, end: 7 });
    expect(ranges[1]).toEqual({ start: 7, end: 14 });
    expect(ranges[2]).toEqual({ start: 14, end: 21 });
  });

  it("splits a ninety second video into nine ten second chunks", () => {
    const ranges = createSwaprSegmentTrimRanges(90, 10);

    expect(ranges).toHaveLength(9);
    expect(ranges.at(0)).toEqual({ start: 0, end: 10 });
    expect(ranges.at(-1)).toEqual({ start: 80, end: 90 });
  });
});
