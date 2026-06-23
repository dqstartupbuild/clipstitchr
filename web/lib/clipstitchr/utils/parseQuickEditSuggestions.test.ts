import { describe, expect, it } from "vitest";
import { parseQuickEditSuggestions } from "@/lib/clipstitchr/utils/parseQuickEditSuggestions";

describe("parseQuickEditSuggestions", () => {
  it("parses structured quick edit suggestions", () => {
    expect(
      parseQuickEditSuggestions({
        trimStart: "1.2",
        trimEnd: 14.8,
        candidateRanges: [
          {
            start: 4,
            end: 8,
            confidence: 0.82,
            signals: ["loading-text", "static-frame"],
            reason: "Loading screen",
            stats: "Mostly static",
          },
        ],
        removeRanges: [
          {
            start: 4.2,
            end: 7.8,
            reason: " Loading screen slows the payoff. ",
          },
        ],
        overlayText: {
          replaceWith: "The moment the landing page finally worked",
          reason: "Clearer hook.",
        },
        crop: {
          mode: "smart-9x16",
          removeBlackBars: true,
          scale: 1.1,
          reason: "Keep the screen visible.",
        },
        summary: "Cut the slow section.",
      }),
    ).toEqual({
      trimStart: 1.2,
      trimEnd: 14.8,
      candidates: [
        {
          start: 4,
          end: 8,
          confidence: 0.82,
          signals: ["loading-text", "static-frame"],
          reason: "Loading screen",
          stats: "Mostly static",
        },
      ],
      removeRanges: [
        {
          start: 4.2,
          end: 7.8,
          reason: "Loading screen slows the payoff.",
        },
      ],
      overlayText: {
        replaceWith: "The moment the landing page finally worked",
        reason: "Clearer hook.",
      },
      crop: {
        mode: "smart-9x16",
        removeBlackBars: true,
        scale: 1.1,
        reason: "Keep the screen visible.",
      },
      summary: "Cut the slow section.",
    });
  });

  it("keeps candidate-only evidence", () => {
    expect(
      parseQuickEditSuggestions({
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

  it("returns undefined when suggestions contain no usable edit", () => {
    expect(
      parseQuickEditSuggestions({
        trimStart: -1,
        removeRanges: [{ start: 7, end: 4 }],
        overlayText: { replaceWith: " " },
        crop: { mode: "square" },
      }),
    ).toBeUndefined();
  });
});
