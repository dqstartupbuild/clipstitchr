import { describe, expect, it } from "vitest";
import { getQuickEditOverlayText } from "@/lib/clipstitchr/utils/getQuickEditOverlayText";

describe("getQuickEditOverlayText", () => {
  it("prefers applied Quick Edit overlay text over score suggestions", () => {
    expect(
      getQuickEditOverlayText({
        performanceScore: {
          quickEditSuggestions: {
            overlayText: {
              replaceWith: "Score suggestion",
            },
            removeRanges: [],
          },
        },
        quickEdit: {
          overlayText: {
            replaceWith: " Applied suggestion ",
            reason: " Current default ",
          },
        },
      }),
    ).toEqual({
      replaceWith: "Applied suggestion",
      reason: "Current default",
    });
  });

  it("falls back to score suggestions when Quick Edit has not been applied", () => {
    expect(
      getQuickEditOverlayText({
        performanceScore: {
          quickEditSuggestions: {
            overlayText: {
              replaceWith: " Score suggestion ",
            },
            removeRanges: [],
          },
        },
      }),
    ).toEqual({
      replaceWith: "Score suggestion",
    });
  });
});
