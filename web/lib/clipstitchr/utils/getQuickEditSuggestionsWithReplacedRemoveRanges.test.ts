import { describe, expect, it } from "vitest";
import { getQuickEditSuggestionsWithReplacedRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithReplacedRemoveRanges";

describe("getQuickEditSuggestionsWithReplacedRemoveRanges", () => {
  it("replaces manual cut ranges while keeping existing quick edit fields", () => {
    expect(
      getQuickEditSuggestionsWithReplacedRemoveRanges({
        duration: 10,
        quickEdit: {
          crop: {
            mode: "smart-9x16",
            scale: 1.2,
          },
          removeRanges: [{ end: 3, reason: "Pause", start: 1 }],
          summary: "Keep the product centered.",
        },
        removeRanges: [{ end: 5, reason: "Loading screen", start: 2 }],
      }),
    ).toEqual({
      crop: {
        mode: "smart-9x16",
        scale: 1.2,
      },
      removeRanges: [{ end: 5, reason: "Loading screen", start: 2 }],
      summary: "Keep the product centered.",
    });
  });

  it("removes empty quick edit metadata when no other fields remain", () => {
    expect(
      getQuickEditSuggestionsWithReplacedRemoveRanges({
        duration: 10,
        quickEdit: {
          removeRanges: [{ end: 5, start: 2 }],
        },
        removeRanges: [],
      }),
    ).toBeUndefined();
  });

  it("keeps non-cut quick edit fields when the last cut is removed", () => {
    expect(
      getQuickEditSuggestionsWithReplacedRemoveRanges({
        duration: 10,
        quickEdit: {
          overlayText: {
            replaceWith: "Wait for the switch",
          },
          removeRanges: [{ end: 5, start: 2 }],
        },
        removeRanges: [],
      }),
    ).toEqual({
      overlayText: {
        replaceWith: "Wait for the switch",
      },
      removeRanges: [],
    });
  });
});
