import { describe, expect, it } from "vitest";
import { getQuickEditSuggestionsWithRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithRemoveRanges";

describe("getQuickEditSuggestionsWithRemoveRanges", () => {
  it("adds new cut ranges to existing quick edit fields", () => {
    expect(
      getQuickEditSuggestionsWithRemoveRanges({
        duration: 10,
        quickEdit: {
          crop: {
            mode: "smart-9x16",
            scale: 1.2,
          },
          removeRanges: [{ end: 3, reason: "Pause", start: 1 }],
          summary: "Keep the product centered.",
        },
        removeRanges: [{ end: 5, reason: "Loading screen", start: 3.5 }],
      }),
    ).toEqual({
      crop: {
        mode: "smart-9x16",
        scale: 1.2,
      },
      removeRanges: [
        { end: 3, reason: "Pause", start: 1 },
        { end: 5, reason: "Loading screen", start: 3.5 },
      ],
      summary: "Keep the product centered.",
    });
  });

  it("returns no metadata when no quick edit or ranges exist", () => {
    expect(
      getQuickEditSuggestionsWithRemoveRanges({
        duration: 10,
        removeRanges: [],
      }),
    ).toBeUndefined();
  });

  it("normalizes overlapping quick edit ranges", () => {
    expect(
      getQuickEditSuggestionsWithRemoveRanges({
        duration: 10,
        quickEdit: {
          overlayText: {
            replaceWith: "Wait for the switch",
          },
          removeRanges: [{ end: 4, start: 2 }],
        },
        removeRanges: [{ end: 6, start: 3 }],
      }),
    ).toEqual({
      overlayText: {
        replaceWith: "Wait for the switch",
      },
      removeRanges: [{ end: 6, start: 2 }],
    });
  });
});
