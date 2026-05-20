import { describe, expect, it } from "vitest";
import {
  avatarGenerationPoseActions,
  avatarGenerationPoses,
  getAvatarGenerationPosesForLocationCategories,
} from "@/lib/clipstitchr/constants/avatarGenerationPoses";

describe("avatarGenerationPoses", () => {
  it("builds five expression variants for every base action", () => {
    expect(avatarGenerationPoseActions.length).toBeGreaterThan(700);
    expect(avatarGenerationPoses).toHaveLength(
      avatarGenerationPoseActions.length * 5,
    );
    expect(new Set(avatarGenerationPoses).size).toBe(
      avatarGenerationPoses.length,
    );
  });

  it("selects category-compatible poses before falling back to all poses", () => {
    const foodPoses = getAvatarGenerationPosesForLocationCategories(["food"]);
    const transitPoses = getAvatarGenerationPosesForLocationCategories([
      "transit",
    ]);
    const unknownCategoryPoses = getAvatarGenerationPosesForLocationCategories(
      [],
    );

    expect(foodPoses.length).toBeGreaterThan(0);
    expect(foodPoses.length).toBeLessThan(avatarGenerationPoses.length);
    expect(foodPoses.some((pose) => pose.includes("coffee"))).toBe(true);
    expect(transitPoses.some((pose) => pose.includes("train ticket"))).toBe(
      true,
    );
    expect(unknownCategoryPoses.length).toBeGreaterThan(0);
    expect(unknownCategoryPoses.length).toBeLessThan(avatarGenerationPoses.length);
    expect(
      unknownCategoryPoses.every((pose) =>
        avatarGenerationPoses.includes(pose),
      ),
    ).toBe(true);
  });
});
