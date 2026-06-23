import { describe, expect, it } from "vitest";
import { readQuickEditSuggestions } from "./readQuickEditSuggestions.mjs";

describe("readQuickEditSuggestions", () => {
  it("keeps valid Quick Edit suggestion fields", () => {
    expect(
      readQuickEditSuggestions({
        candidates: [
          {
            start: 2,
            end: 4,
            confidence: 1.4,
            signals: ["loading-text", "low-motion", "unknown"],
            reason: " Loading screen ",
            stats: " 92% static frames ",
          },
          {
            start: 5,
            end: 4,
            confidence: 0.8,
            signals: ["silence"],
          },
        ],
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
      candidates: [
        {
          start: 2,
          end: 4,
          confidence: 1,
          signals: ["loading-text", "low-motion"],
          reason: "Loading screen",
          stats: "92% static frames",
        },
      ],
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

  it("keeps candidate-only evidence", () => {
    expect(
      readQuickEditSuggestions({
        candidates: [
          {
            start: 1,
            end: 3,
            confidence: 0.7,
            signals: ["silence"],
          },
        ],
      }),
    ).toEqual({
      candidates: [
        {
          start: 1,
          end: 3,
          confidence: 0.7,
          signals: ["silence"],
        },
      ],
      removeRanges: [],
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
