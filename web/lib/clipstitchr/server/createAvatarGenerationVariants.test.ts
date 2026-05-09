import { describe, expect, it } from "vitest";
import { createAvatarGenerationVariants } from "@/lib/clipstitchr/server/createAvatarGenerationVariants";

describe("createAvatarGenerationVariants", () => {
  it("stores entered context as the photo pose description", () => {
    const variants = createAvatarGenerationVariants({
      context: "holding a coffee and looking toward the camera",
      count: 3,
      lighting: "natural",
      location: "downtown sidewalk",
      style: "selfie",
    });

    expect(variants).toHaveLength(3);
    expect(variants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locationDescription: "downtown sidewalk",
          poseDescription: "holding a coffee and looking toward the camera",
        }),
      ]),
    );
  });

  it("generates a pose description when context is empty", () => {
    const [variant] = createAvatarGenerationVariants({
      context: "",
      count: 3,
      lighting: "any",
      location: "",
      style: "candid",
    });

    expect(variant?.poseDescription).toEqual(expect.any(String));
    expect(variant?.poseDescription.length).toBeGreaterThan(0);
  });
});
