import { describe, expect, it } from "vitest";
import { calculateFrameLumaDifference } from "@/lib/clipstitchr/tools/deadSpaceFinder/calculateFrameLumaDifference";
import { createDeadSpaceSamplingTimestamps } from "@/lib/clipstitchr/tools/deadSpaceFinder/createDeadSpaceSamplingTimestamps";
import { createDeadSpaceSpans } from "@/lib/clipstitchr/tools/deadSpaceFinder/createDeadSpaceSpans";
import { defaultDeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/defaultDeadSpaceAnalysisOptions";

describe("dead-space analysis helpers", () => {
  it("normalizes frame luminance change from identical through black-to-white", () => {
    const black = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
    const white = new Uint8ClampedArray([
      255, 255, 255, 255, 255, 255, 255, 255,
    ]);

    expect(calculateFrameLumaDifference(black, black)).toBe(0);
    expect(calculateFrameLumaDifference(black, white)).toBeCloseTo(1);
    expect(
      calculateFrameLumaDifference(black, new Uint8ClampedArray([0])),
    ).toBe(1);
  });

  it("bounds sparse sampling to 360 points", () => {
    expect(createDeadSpaceSamplingTimestamps(2, 0.5)).toEqual([0, 0.5, 1, 1.5]);
    const capped = createDeadSpaceSamplingTimestamps(180, 0.25);
    expect(capped).toHaveLength(360);
    expect(capped.at(-1)).toBe(179.5);
  });

  it("groups only consecutive quiet and still samples that meet the minimum duration", () => {
    const spans = createDeadSpaceSpans(
      [
        { timestamp: 0, audioRms: 0.01, visualChange: 1 },
        { timestamp: 0.5, audioRms: 0.01, visualChange: 0.01 },
        { timestamp: 1, audioRms: 0.02, visualChange: 0.02 },
        { timestamp: 1.5, audioRms: 0.01, visualChange: 0.2 },
        { timestamp: 2, audioRms: null, visualChange: 0.01 },
        { timestamp: 2.5, audioRms: null, visualChange: 0.01 },
        { timestamp: 3, audioRms: null, visualChange: 0.01 },
      ],
      { ...defaultDeadSpaceAnalysisOptions, minimumSpanSeconds: 1 },
    );

    expect(spans).toHaveLength(2);
    expect(spans[0]).toMatchObject({ start: 0.5, end: 1.5, duration: 1 });
    expect(spans[1]).toMatchObject({
      start: 2,
      end: 3.5,
      duration: 1.5,
      averageAudioRms: null,
    });
  });
});
