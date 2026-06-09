import { describe, expect, it } from "vitest";
import { createCliprLipSyncSegmentRanges } from "@/lib/clipstitchr/server/createCliprLipSyncSegmentRanges";

describe("createCliprLipSyncSegmentRanges", () => {
  it("splits PixVerse-sized 60 second clips into 30 second ranges", () => {
    expect(
      createCliprLipSyncSegmentRanges({
        segmentSeconds: 30,
        totalDurationSeconds: 60,
      }),
    ).toEqual([
      { durationSeconds: 30, index: 0, startSeconds: 0 },
      { durationSeconds: 30, index: 1, startSeconds: 30 },
    ]);
  });

  it("keeps ranges within a configured model maximum", () => {
    expect(
      createCliprLipSyncSegmentRanges({
        maximumSegmentSeconds: 10,
        minimumSegmentSeconds: 2,
        segmentSeconds: 8,
        totalDurationSeconds: 30,
      }),
    ).toEqual([
      { durationSeconds: 8, index: 0, startSeconds: 0 },
      { durationSeconds: 8, index: 1, startSeconds: 8 },
      { durationSeconds: 8, index: 2, startSeconds: 16 },
      { durationSeconds: 6, index: 3, startSeconds: 24 },
    ]);
  });

  it("merges very small trailing ranges when the model has a minimum duration", () => {
    expect(
      createCliprLipSyncSegmentRanges({
        maximumSegmentSeconds: 10,
        minimumSegmentSeconds: 2,
        segmentSeconds: 8,
        totalDurationSeconds: 17,
      }),
    ).toEqual([
      { durationSeconds: 8, index: 0, startSeconds: 0 },
      { durationSeconds: 9, index: 1, startSeconds: 8 },
    ]);
  });
});
