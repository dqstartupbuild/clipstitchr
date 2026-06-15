import { describe, expect, it } from "vitest";
import { readQuickEditSuggestions } from "./readQuickEditSuggestions.mjs";

describe("readQuickEditSuggestions", () => {
  it("keeps valid Quick Edit suggestion fields", () => {
    expect(
      readQuickEditSuggestions({
        crop: {
          mode: "smart-9x16",
          removeBlackBars: true,
          scale: 1.08,
        },
        overlayText: {
          replaceWith: " Better hook ",
          reason: " Clearer first idea ",
        },
        removeRanges: [
          { start: 2, end: 4, reason: "Slow moment" },
          { start: 8, end: 7 },
        ],
        summary: " Tightened the slow section ",
        trimEnd: null,
        trimStart: 1.2,
      }),
    ).toEqual({
      crop: {
        mode: "smart-9x16",
        removeBlackBars: true,
        scale: 1.08,
      },
      overlayText: {
        replaceWith: "Better hook",
        reason: "Clearer first idea",
      },
      removeRanges: [{ start: 2, end: 4, reason: "Slow moment" }],
      summary: "Tightened the slow section",
      trimEnd: null,
      trimStart: 1.2,
    });
  });

  it("returns undefined when no usable suggestion exists", () => {
    expect(
      readQuickEditSuggestions({
        overlayText: { replaceWith: " " },
        removeRanges: [{ start: 3, end: 1 }],
      }),
    ).toBeUndefined();
  });
});
