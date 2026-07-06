import { describe, expect, it } from "vitest";
import { getQuickEditReviewRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditReviewRemoveRanges";

describe("getQuickEditReviewRemoveRanges", () => {
  it("prefers explicit remove ranges over candidate evidence", () => {
    expect(
      getQuickEditReviewRemoveRanges({
        candidates: [
          {
            start: 1,
            end: 4,
            confidence: 0.8,
            signals: ["loading-text"],
            reason: "Loading screen",
          },
        ],
        removeRanges: [{ start: 1.2, end: 3.8, reason: "Cut the loading wait" }],
      }),
    ).toEqual([{ start: 1.2, end: 3.8, reason: "Cut the loading wait" }]);
  });

  it("turns candidate-only evidence into reviewable cut ranges", () => {
    expect(
      getQuickEditReviewRemoveRanges({
        candidates: [
          {
            start: 2,
            end: 6,
            confidence: 0.86,
            signals: ["static-frame", "low-motion"],
            reason: "The screen barely changes.",
          },
        ],
        removeRanges: [],
      }),
    ).toEqual([{ start: 2, end: 6, reason: "The screen barely changes." }]);
  });

  it("drops invalid candidate ranges", () => {
    expect(
      getQuickEditReviewRemoveRanges({
        candidates: [
          {
            start: 5,
            end: 3,
            confidence: 0.86,
            signals: ["static-frame"],
          },
        ],
        removeRanges: [],
      }),
    ).toEqual([]);
  });
});
