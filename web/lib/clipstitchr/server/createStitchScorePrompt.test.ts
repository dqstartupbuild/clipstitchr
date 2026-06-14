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
    expect(prompt).toContain("suggestedOverlayText");
    expect(prompt).toContain("suggestedOpeningLine");
    expect(prompt).toContain("Wait for it");
    expect(prompt).toContain("Person reacts in the first second.");
  });
});
