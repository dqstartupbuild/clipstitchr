import { describe, expect, it } from "vitest";
import { createAvatarPhotoGenerationPrompt } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt";

const variant = {
  outfitDescription: "a plain denim jacket",
  locationDescription: "a city sidewalk",
  poseDescription: "walking toward the camera",
  lighting: "natural" as const,
  style: "selfie" as const,
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
});
