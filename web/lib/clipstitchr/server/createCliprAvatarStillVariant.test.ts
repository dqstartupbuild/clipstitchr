import { describe, expect, it } from "vitest";
import { createCliprAvatarStillVariant } from "@/lib/clipstitchr/server/createCliprAvatarStillVariant";

describe("createCliprAvatarStillVariant", () => {
  it("maps the full avatar scene into one UGC avatar photo variant", () => {
    expect(
      createCliprAvatarStillVariant({
        id: "scene-1",
        index: 0,
        sceneType: "avatar",
        scriptText: "Start with the simple version and build from there.",
        visualPrompt: "Vertical selfie video in a home gym",
        estimatedDurationSeconds: 30,
      }),
    ).toMatchObject({
      lighting: "natural",
      locationDescription: "Vertical selfie video in a home gym",
      outfitDescription: expect.stringContaining("context-appropriate"),
      poseDescription: expect.stringContaining(
        "Start with the simple version and build from there.",
      ),
      style: "ugc",
    });
  });

  it("applies scene controls over the generated visual prompt", () => {
    expect(
      createCliprAvatarStillVariant(
        {
          id: "scene-1",
          index: 0,
          sceneType: "avatar",
          scriptText: "Progress looks obvious when you know what to track.",
          visualPrompt: "Vertical selfie video in a home gym",
          estimatedDurationSeconds: 30,
        },
        {
          location: "gym locker room mirror",
          outfit: "black compression shirt and gray training shorts",
          pose: "taking a back progress photo",
        },
      ),
    ).toMatchObject({
      locationDescription: "gym locker room mirror",
      outfitDescription: "black compression shirt and gray training shorts",
      poseDescription: expect.stringContaining("taking a back progress photo"),
    });
  });
});
