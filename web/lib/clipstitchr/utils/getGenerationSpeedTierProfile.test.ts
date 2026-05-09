import { describe, expect, it } from "vitest";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";

describe("getGenerationSpeedTierProfile", () => {
  it("uses slower single-job settings for Creator", () => {
    expect(getGenerationSpeedTierProfile("creator")).toMatchObject({
      avatarImageConcurrency: 1,
      avatarImageQuality: "auto",
      publicSpeedLabel: "Slow",
      swaprCharacterOrientation: "image",
      swaprMode: "pro",
    });
  });

  it("uses faster defaults for Pro and Studio", () => {
    expect(getGenerationSpeedTierProfile("pro")).toMatchObject({
      avatarImageConcurrency: 2,
      avatarImageQuality: "medium",
      publicSpeedLabel: "Fast",
      swaprCharacterOrientation: "image",
      swaprMode: "std",
    });
    expect(getGenerationSpeedTierProfile("studio")).toMatchObject({
      avatarImageConcurrency: 4,
      avatarImageQuality: "medium",
      publicSpeedLabel: "Faster",
      swaprCharacterOrientation: "image",
      swaprMode: "std",
    });
  });
});
