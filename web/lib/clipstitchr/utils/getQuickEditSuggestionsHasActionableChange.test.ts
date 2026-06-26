import { describe, expect, it } from "vitest";
import { getQuickEditSuggestionsHasActionableChange } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsHasActionableChange";

describe("getQuickEditSuggestionsHasActionableChange", () => {
  it("returns false for candidate-only evidence", () => {
    expect(
      getQuickEditSuggestionsHasActionableChange({
        candidates: [
          {
            start: 1,
            end: 3,
            confidence: 0.8,
            signals: ["loading-text"],
          },
        ],
        removeRanges: [],
      }),
    ).toBe(false);
  });

  it("returns false for overlay-only suggestions", () => {
    expect(
      getQuickEditSuggestionsHasActionableChange({
        overlayText: {
          replaceWith: "This should come from Hook Lab",
        },
        removeRanges: [],
      }),
    ).toBe(false);
  });

  it("returns true for edits that can change playback or framing", () => {
    expect(
      getQuickEditSuggestionsHasActionableChange({
        removeRanges: [{ start: 1, end: 3 }],
      }),
    ).toBe(true);
    expect(
      getQuickEditSuggestionsHasActionableChange({
        crop: { mode: "smart-9x16" },
        removeRanges: [],
      }),
    ).toBe(true);
  });
});
