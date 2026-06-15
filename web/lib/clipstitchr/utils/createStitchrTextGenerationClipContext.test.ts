import { describe, expect, it } from "vitest";
import { createStitchrTextGenerationClipContext } from "@/lib/clipstitchr/utils/createStitchrTextGenerationClipContext";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

describe("createStitchrTextGenerationClipContext", () => {
  it("includes score overlay suggestions as hook hints", () => {
    const context = createStitchrTextGenerationClipContext({
      clipType: "ugc",
      id: "ugc_1",
      libraryKind: "ugc",
      name: "Founder reaction",
      performanceScore: {
        bestUse: "Use as the emotional opener.",
        fixes: [],
        overall: 82,
        quickEditSuggestions: {
          overlayText: {
            replaceWith: "The moment I saw the real problem",
            reason: "The suggestion matches the visual reaction.",
          },
          removeRanges: [],
        },
        strengths: [],
        summary: "Strong reaction.",
      },
      tags: ["reaction"],
      videoDescription: "A founder pauses after seeing a messy landing page.",
    } as unknown as VideoClipMetadata);

    expect(context).toEqual(
      expect.objectContaining({
        id: "ugc_1",
        quickEditOverlayTextHint: "The moment I saw the real problem",
        quickEditOverlayTextReason: "The suggestion matches the visual reaction.",
        role: "ugc",
      }),
    );
  });

  it("prefers applied Quick Edit overlay text over score suggestions", () => {
    const context = createStitchrTextGenerationClipContext({
      clipType: "ugc",
      id: "ugc_1",
      libraryKind: "ugc",
      name: "Founder reaction",
      performanceScore: {
        bestUse: "Use as the emotional opener.",
        fixes: [],
        overall: 82,
        quickEditSuggestions: {
          overlayText: {
            replaceWith: "The score-only hook",
          },
          removeRanges: [],
        },
        strengths: [],
        summary: "Strong reaction.",
      },
      quickEdit: {
        appliedAt: "2026-06-15T00:00:00.000Z",
        overlayText: {
          replaceWith: "The applied Quick Edit hook",
          reason: "Applied edits are the current clip defaults.",
        },
        removeRanges: [],
        source: "ai-score",
      },
      tags: ["reaction"],
      videoDescription: "A founder pauses after seeing a messy landing page.",
    } as unknown as VideoClipMetadata);

    expect(context).toEqual(
      expect.objectContaining({
        id: "ugc_1",
        quickEditOverlayTextHint: "The applied Quick Edit hook",
        quickEditOverlayTextReason: "Applied edits are the current clip defaults.",
        role: "ugc",
      }),
    );
  });

  it("omits blank Quick Edit overlay text", () => {
    const context = createStitchrTextGenerationClipContext({
      clipType: "demo",
      id: "demo_1",
      name: "Demo",
      quickEdit: {
        appliedAt: "2026-06-15T00:00:00.000Z",
        overlayText: {
          replaceWith: " ",
          reason: " ",
        },
        removeRanges: [],
        source: "ai-score",
      },
    } as unknown as VideoClipMetadata);

    expect(context.quickEditOverlayTextHint).toBeUndefined();
    expect(context.quickEditOverlayTextReason).toBeUndefined();
    expect(context.role).toBe("demo");
  });
});
