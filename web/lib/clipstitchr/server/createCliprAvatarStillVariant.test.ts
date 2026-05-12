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
      outfitDescription: expect.stringContaining("casual creator clothing"),
      poseDescription: expect.stringContaining(
        "Start with the simple version and build from there.",
      ),
      style: "ugc",
    });
  });
});
