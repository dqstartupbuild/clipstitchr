import { describe, expect, it } from "vitest";
import { toStudioClipsWorkerClaim } from "./toStudioClipsWorkerClaim";

describe("toStudioClipsWorkerClaim", () => {
  it("includes the strictly normalized caption renderer settings", () => {
    const claim = toStudioClipsWorkerClaim({
      attempt: 1,
      createdAt: "2026-08-12T12:00:00.000Z",
      id: "task_1",
      leaseId: "lease_1",
      options: {
        addSubtitles: true,
        captionStyle: {
          customFontObjectKey:
            "users/user_1/studio/v1/font/product_1/font_1/font.ttf",
          templateId: "minimal",
        },
        includeBroll: false,
        outputFormat: "vertical",
      },
      ownerId: "user_1",
      productId: "product_1",
      source: {
        kind: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    } as never);
    expect(claim.schemaVersion).toBe("studio-clips-claim-v2");
    expect(claim.mode).toBe("initial");
    if (claim.mode !== "initial") throw new Error("Expected an initial claim.");
    expect(claim.options).toEqual({
      addSubtitles: true,
      captionStyle: {
        customFontObjectKey:
          "users/user_1/studio/v1/font/product_1/font_1/font.ttf",
        templateId: "minimal",
      },
      includeBroll: false,
      outputFormat: "vertical",
    });
  });
});
