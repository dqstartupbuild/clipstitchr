import { describe, expect, it } from "vitest";
import { createAvatarPhotoGenerationPrompt } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt";

const variant = {
  outfitDescription: "a plain denim jacket",
  locationDescription: "a city sidewalk",
  poseDescription: "walking toward the camera",
  lighting: "natural" as const,
  style: "ugc" as const,
};

describe("createAvatarPhotoGenerationPrompt", () => {
  it("preserves the same person by default", () => {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: "short dark hair and oval face",
      variant,
    });

    expect(prompt).toContain("same person from the reference image");
    expect(prompt).toContain("Preserve the person's facial identity");
  });

  it("can request a similar but different person", () => {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: "short dark hair and oval face",
      identityMode: "similar",
      variant,
    });

    expect(prompt).toContain("new fictional person");
    expect(prompt).toContain("noticeably different facial identity");
    expect(prompt).toContain("Do not clone, preserve, or duplicate");
  });

  it("requests authentic UGC source photo styling", () => {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: "short dark hair and oval face",
      variant,
    });

    expect(prompt).toContain("creator-style UGC source photo");
    expect(prompt).toContain("raw source material for a UGC ad");
    expect(prompt).toContain("not a studio portrait");
  });

  it("uses image-to-image wording for Pruna z-image-turbo", () => {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: "short dark hair and oval face",
      modelId:
        "prunaai/z-image-turbo-img2img:5c958e90e0f904240629ee35c69196e3bd790b5528c0696705ebdb1656871dd8",
      variant,
    });

    expect(prompt).toContain("same person from the input image");
    expect(prompt).toContain("Use the input image as the image-to-image source");
    expect(prompt).toContain("Transform the wardrobe, location, pose, and lighting");
  });
});
