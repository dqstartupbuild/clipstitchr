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

  it("makes the pose action primary over the background location", () => {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: "short dark hair and oval face",
      variant,
    });

    expect(prompt).toContain("Background/location for this new photo");
    expect(prompt).toContain("Primary body pose/action");
    expect(prompt).toContain("Do not let it override the primary body pose/action");
  });

  it("uses character reference wording for MiniMax Image-01", () => {
    const prompt = createAvatarPhotoGenerationPrompt({
      avatarDescription: "short dark hair and oval face",
      modelId: "minimax/image-01",
      variant,
    });

    expect(prompt).toContain("same person from the subject reference image");
    expect(prompt).toContain(
      "Use the subject reference image as the character reference",
    );
    expect(prompt).toContain(
      "Preserve the subject reference person's facial identity",
    );
  });
});
