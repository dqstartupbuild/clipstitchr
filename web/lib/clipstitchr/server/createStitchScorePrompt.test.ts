import { describe, expect, it } from "vitest";
import { createStitchScorePrompt } from "@/lib/clipstitchr/server/createStitchScorePrompt";

describe("createStitchScorePrompt", () => {
  it("asks for stitch score fields with saved stitch and source context", () => {
    const prompt = createStitchScorePrompt({
      sourceClips: [
        {
          clipType: "ugc",
          createdAt: "2026-06-14T00:00:00.000Z",
          duration: 6,
          hasAudio: true,
          height: 1920,
          id: "ugc_1",
          libraryKind: "ugc",
          mimeType: "video/mp4",
          name: "Reaction",
          originalName: "reaction.mp4",
          originalSize: 100,
          ownerId: "user_123",
          size: 100,
          sourceMimeType: "video/mp4",
          tags: [],
          updatedAt: "2026-06-14T00:00:00.000Z",
          videoDescription: "Person reacts in the first second.",
          videoObject: {
            contentType: "video/mp4",
            key: "users/user_123/video.mp4",
            size: 100,
          },
          width: 1080,
        },
      ] as never,
      stitch: {
        createdAt: "2026-06-14T00:00:00.000Z",
        demoClipId: "demo_1",
        demoClipName: "Demo",
        duration: 12,
        height: 1920,
        id: "stitch_1",
        name: "Reaction + Demo",
        ownerId: "user_123",
        textOverlay: {
          backgroundColor: "#000000",
          color: "#ffffff",
          endTime: 4,
          fontSize: 48,
          startTime: 0,
          styleId: "hook",
          text: "Wait for it",
          width: 0.8,
          x: 0.5,
          y: 0.5,
        },
        ugcClipId: "ugc_1",
        ugcClipName: "Reaction",
        width: 1080,
      } as never,
      videoInputDescription: "Rendered video attached.",
    });

    expect(prompt).toContain("overallRetentionEstimate");
    expect(prompt).toContain("hookToDemoFlow");
    expect(prompt).toContain("dropOffRiskPoints");
    expect(prompt).toContain("suggestedTrims");
    expect(prompt).toContain("suggestedOpeningLine");
    expect(prompt).toContain("quickEditSuggestions.candidates");
    expect(prompt).toContain("loading-text");
    expect(prompt).toContain("manual cut editor");
    expect(prompt).toContain("Wait for it");
    expect(prompt).toContain("Person reacts in the first second.");
    expect(prompt).toContain("first-score");
    expect(prompt).toContain("actual ordered source clips");
    expect(prompt).toContain("opening-to-payoff flow score");
    expect(prompt).toContain("Do not suggest new text overlay copy.");
    expect(prompt).toContain("Do not return suggestedOverlayText");
    expect(prompt).not.toContain('"suggestedOverlayText"');
    expect(prompt).not.toContain('"overlayText":{"replaceWith"');
  });

  it("scores a standalone source without assuming an omitted demo", () => {
    const prompt = createStitchScorePrompt({
      sourceClips: [
        {
          clipType: "ugc",
          createdAt: "2026-06-14T00:00:00.000Z",
          duration: 5,
          hasAudio: true,
          height: 1920,
          id: "ugc_1",
          libraryKind: "ugc",
          mimeType: "video/mp4",
          name: "Creator action",
          originalName: "creator-action.mp4",
          originalSize: 100,
          ownerId: "user_123",
          size: 100,
          sourceMimeType: "video/mp4",
          tags: [],
          updatedAt: "2026-06-14T00:00:00.000Z",
          videoObject: { contentType: "video/mp4", key: "ugc.mp4", size: 100 },
          width: 1080,
        },
      ] as never,
      stitch: {
        createdAt: "2026-06-14T00:00:00.000Z",
        demoClipId: "ugc_1",
        demoClipName: "Creator action",
        duration: 5,
        height: 1920,
        id: "stitch_1",
        mode: "normal",
        name: "Creator action",
        ownerId: "user_123",
        sequenceSegments: [
          {
            clipId: "ugc_1",
            clipName: "Creator action",
            clipType: "ugc",
            duration: 5,
            order: 0,
            trimRange: { end: 5, start: 0 },
          },
        ],
        ugcClipId: "ugc_1",
        ugcClipName: "Creator action",
        width: 1080,
      } as never,
      videoInputDescription: "Rendered video attached.",
    });

    expect(prompt).toContain("standalone source");
    expect(prompt).toContain("Creator action (ugc, 5s)");
  });

  it("includes archived first-score context for rescoring", () => {
    const prompt = createStitchScorePrompt({
      sourceClips: [],
      stitch: {
        createdAt: "2026-06-14T00:00:00.000Z",
        demoClipId: "demo_1",
        demoClipName: "Demo",
        duration: 10,
        firstStitchScore: {
          dropOffRiskPoints: ["3-5s loading screen"],
          hookToDemoFlow: 70,
          overallRetentionEstimate: 66,
          quickEditSuggestions: {
            removeRanges: [{ start: 3, end: 5 }],
          },
          suggestedOpeningLine: "Start on the reaction",
          suggestedOverlayText: [],
          suggestedTrims: ["Cut the loading screen"],
          summary: "Cut the slow middle before posting.",
        },
        height: 1920,
        id: "stitch_1",
        name: "Reaction + Demo",
        ownerId: "user_123",
        quickEdit: {
          appliedAt: "2026-06-15T00:00:00.000Z",
          removeRanges: [{ start: 3, end: 5 }],
          source: "ai-score",
        },
        stitchScore: {
          dropOffRiskPoints: ["3-5s loading screen"],
          hookToDemoFlow: 70,
          overallRetentionEstimate: 66,
          suggestedOpeningLine: "Start on the reaction",
          suggestedOverlayText: [],
          suggestedTrims: ["Cut the loading screen"],
          summary: "Cut the slow middle before posting.",
        },
        ugcClipId: "ugc_1",
        ugcClipName: "Reaction",
        width: 1080,
      } as never,
      videoInputDescription: "Rendered video attached.",
    });

    expect(prompt).toContain("Reassess this finished ClipStitchr");
    expect(prompt).toContain("rescore-reassessment");
    expect(prompt).toContain("firstScore");
    expect(prompt).toContain("completedImprovements");
    expect(prompt).toContain("remainingImprovements");
    expect(prompt).toContain("Cut the loading screen");
  });
});
