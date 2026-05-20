import { describe, expect, it } from "vitest";
import {
  avatarGenerationLocationOptions,
  avatarGenerationLocations,
  avatarGenerationLocationSettings,
  getAvatarGenerationLocationCategories,
} from "@/lib/clipstitchr/constants/avatarGenerationLocations";

describe("avatarGenerationLocations", () => {
  it("builds five mood variants for every base location", () => {
    expect(avatarGenerationLocationSettings.length).toBeGreaterThan(300);
    expect(avatarGenerationLocationOptions).toHaveLength(
      avatarGenerationLocationSettings.length * 5,
    );
    expect(avatarGenerationLocations).toEqual(
      avatarGenerationLocationOptions.map((location) => location.description),
    );
    expect(new Set(avatarGenerationLocations).size).toBe(
      avatarGenerationLocations.length,
    );
  });

  it("classifies location categories from location text", () => {
    expect(
      getAvatarGenerationLocationCategories(
        "a coffee shop table beside a train station window",
      ),
    ).toEqual(expect.arrayContaining(["food", "transit", "travel"]));
    expect(
      getAvatarGenerationLocationCategories(
        "a ski lodge window with snowy trees outside",
      ),
    ).toEqual(expect.arrayContaining(["winter"]));
    expect(
      getAvatarGenerationLocationCategories(
        "a home improvement store aisle with lighting fixtures nearby",
      ),
    ).toEqual(expect.arrayContaining(["shopping", "diy"]));
  });
});
