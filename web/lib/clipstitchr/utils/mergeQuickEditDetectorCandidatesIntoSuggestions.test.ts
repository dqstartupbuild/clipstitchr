import { describe, expect, it } from "vitest";
import { mergeQuickEditDetectorCandidatesIntoSuggestions } from "@/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoSuggestions";

describe("mergeQuickEditDetectorCandidatesIntoSuggestions", () => {
  it("preserves detector candidates without creating review cuts", () => {
    expect(
      mergeQuickEditDetectorCandidatesIntoSuggestions({
        detectorCandidates: [
          {
            start: 2,
            end: 4,
            confidence: 0.82,
            signals: ["silence"],
          },
        ],
      }),
    ).toEqual({
      candidates: [
        {
          start: 2,
          end: 4,
          confidence: 0.82,
          signals: ["silence"],
        },
      ],
      removeRanges: [],
    });
  });

  it("dedupes detector candidates already returned by the model", () => {
    expect(
      mergeQuickEditDetectorCandidatesIntoSuggestions({
        detectorCandidates: [
          {
            start: 2,
            end: 4,
            confidence: 0.82,
            signals: ["silence"],
          },
        ],
        suggestions: {
          candidates: [
            {
              start: 2,
              end: 4,
              confidence: 0.9,
              signals: ["silence"],
            },
          ],
          removeRanges: [{ start: 2.2, end: 3.8 }],
        },
      }),
    ).toEqual({
      candidates: [
        {
          start: 2,
          end: 4,
          confidence: 0.9,
          signals: ["silence"],
        },
      ],
      removeRanges: [{ start: 2.2, end: 3.8 }],
    });
  });
});
