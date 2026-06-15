import { describe, expect, it } from "vitest";
import { getQuickEditPlaybackDuration } from "./getQuickEditPlaybackDuration.mjs";

describe("getQuickEditPlaybackDuration", () => {
  it("subtracts internal removed ranges inside the active trim", () => {
    expect(
      getQuickEditPlaybackDuration({
        duration: 12,
        playbackRate: 2,
        removeRanges: [
          { start: 3, end: 5 },
          { start: 8, end: 12 },
        ],
        trimRange: { start: 1, end: 11 },
      }),
    ).toBe(2.5);
  });

  it("merges overlapping remove ranges", () => {
    expect(
      getQuickEditPlaybackDuration({
        duration: 10,
        removeRanges: [
          { start: 2, end: 5 },
          { start: 4, end: 7 },
        ],
        trimRange: { start: 0, end: 10 },
      }),
    ).toBe(5);
  });
});
