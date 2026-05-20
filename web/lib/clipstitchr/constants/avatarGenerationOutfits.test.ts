import { describe, expect, it } from "vitest";
import {
  avatarGenerationOutfitBottoms,
  avatarGenerationOutfits,
  avatarGenerationOutfitTops,
  getAvatarGenerationOutfits,
} from "@/lib/clipstitchr/constants/avatarGenerationOutfits";

describe("avatarGenerationOutfits", () => {
  it("builds the full top and bottom outfit matrix", () => {
    expect(avatarGenerationOutfitTops.length).toBeGreaterThan(100);
    expect(avatarGenerationOutfitBottoms.length).toBeGreaterThan(100);
    expect(avatarGenerationOutfits).toHaveLength(
      avatarGenerationOutfitTops.length * avatarGenerationOutfitBottoms.length,
    );
    expect(new Set(avatarGenerationOutfits).size).toBe(
      avatarGenerationOutfits.length,
    );
  });

  it("filters wardrobe-specific outfits without dropping neutral outfits", () => {
    const allOutfits = getAvatarGenerationOutfits("any");
    const maleOutfits = getAvatarGenerationOutfits("male");
    const femaleOutfits = getAvatarGenerationOutfits("female");

    expect(allOutfits).toBe(avatarGenerationOutfits);
    expect(maleOutfits.length).toBeLessThan(allOutfits.length);
    expect(femaleOutfits).toHaveLength(allOutfits.length);
    expect(femaleOutfits.some((outfit) => outfit.includes("midi skirt"))).toBe(
      true,
    );
    expect(maleOutfits.some((outfit) => outfit.includes("midi skirt"))).toBe(
      false,
    );
    expect(femaleOutfits.some((outfit) => outfit.includes("white sneakers"))).toBe(
      true,
    );
  });
});
