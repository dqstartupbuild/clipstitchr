import { describe, expect, it } from "vitest";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";

describe("getQuickEditPlayableRanges", () => {
  it("splits a trimmed clip around internal remove ranges", () => {
    expect(
      getQuickEditPlayableRanges(
        { start: 1, end: 10 },
        12,
        [
          { start: 3, end: 4 },
          { start: 6, end: 8 },
        ],
      ),
    ).toEqual([
      { start: 1, end: 3 },
      { start: 4, end: 6 },
      { start: 8, end: 10 },
    ]);
  });

  it("returns no playable ranges when the remove range covers the trim", () => {
    expect(
      getQuickEditPlayableRanges(
        { start: 2, end: 5 },
        8,
        [{ start: 0, end: 8 }],
      ),
    ).toEqual([]);
  });
});
