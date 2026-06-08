import { describe, expect, it } from "vitest";
import {
  avatarGenerationLocations,
  avatarGenerationLocationSettings,
} from "@/lib/clipstitchr/constants/avatarGenerationLocations";
import {
  avatarGenerationOutfitBottoms,
  avatarGenerationOutfits,
  avatarGenerationOutfitTops,
  getAvatarGenerationOutfits,
} from "@/lib/clipstitchr/constants/avatarGenerationOutfits";
import {
  avatarGenerationPoseActions,
  avatarGenerationPoses,
  getAvatarGenerationPosesForLocationCategories,
} from "@/lib/clipstitchr/constants/avatarGenerationPoses";
import { createAvatarGenerationVariants } from "@/lib/clipstitchr/server/createAvatarGenerationVariants";

describe("createAvatarGenerationVariants", () => {
  it("keeps a broad preset space for generated avatar scenarios", () => {
    expect(avatarGenerationOutfitTops.length).toBeGreaterThanOrEqual(120);
    expect(avatarGenerationOutfitBottoms.length).toBeGreaterThanOrEqual(125);
    expect(avatarGenerationOutfits.length).toBeGreaterThanOrEqual(15_000);
    expect(avatarGenerationLocationSettings.length).toBeGreaterThanOrEqual(375);
    expect(avatarGenerationLocations.length).toBeGreaterThanOrEqual(1_875);
    expect(avatarGenerationPoseActions.length).toBeGreaterThanOrEqual(753);
    expect(avatarGenerationPoses.length).toBeGreaterThanOrEqual(3_765);
    expect(
      avatarGenerationOutfits.length *
      avatarGenerationLocations.length *
      avatarGenerationPoses.length,
    ).toBeGreaterThanOrEqual(105_890_625_000);
  });

  it("filters female-coded outfit presets out of male wardrobe generations", () => {
    const maleOutfits = getAvatarGenerationOutfits("male");
    const femaleOutfits = getAvatarGenerationOutfits("female");

    expect(maleOutfits.some((outfit) => /\bskirt\b/i.test(outfit))).toBe(false);
    expect(femaleOutfits.some((outfit) => /\bskirt\b/i.test(outfit))).toBe(true);
  });

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

  it("filters generated actions to relevant location categories", () => {
    const fitnessPoses =
      getAvatarGenerationPosesForLocationCategories(["fitness"]);
    const beautyPoses = getAvatarGenerationPosesForLocationCategories([
      "beauty",
    ]);

    expect(
      fitnessPoses.some((pose) => pose.includes("jumping rope")),
    ).toBe(true);
    expect(
      fitnessPoses.some((pose) => pose.includes("shaping clay")),
    ).toBe(false);
    expect(
      beautyPoses.some((pose) => pose.includes("applying makeup")),
    ).toBe(true);
    expect(
      beautyPoses.some((pose) => pose.includes("dribbling a basketball")),
    ).toBe(false);
  });

  it("uses custom locations to choose compatible generated actions", () => {
    const variants = Array.from({ length: 10 }, () =>
      createAvatarGenerationVariants({
        context: "",
        count: 3,
        lighting: "any",
        location: "a gym locker room mirror",
        style: "candid",
      })[0],
    );

    expect(
      variants.every(
        (variant) =>
          variant?.locationDescription === "a gym locker room mirror" &&
          !variant.poseDescription.includes("shaping clay"),
      ),
    ).toBe(true);
  });

  it("uses entered outfit controls when provided", () => {
    const variants = createAvatarGenerationVariants({
      context: "taking a gym progress mirror photo",
      count: 3,
      lighting: "natural",
      location: "gym locker room",
      outfit: "black compression shirt and gray training shorts",
      style: "ugc",
    });

    expect(variants).toHaveLength(3);
    expect(
      variants.every(
        (variant) =>
          variant.outfitDescription ===
          "black compression shirt and gray training shorts",
      ),
    ).toBe(true);
  });

  it("infers context-appropriate clothing for custom scenes without outfit controls", () => {
    const [variant] = createAvatarGenerationVariants({
      context: "taking a gym progress mirror photo",
      count: 1,
      lighting: "natural",
      location: "gym locker room",
      style: "ugc",
    });

    expect(variant?.outfitDescription).toContain("context-appropriate");
    expect(variant?.outfitDescription).toContain("gym or fitness");
  });
});
