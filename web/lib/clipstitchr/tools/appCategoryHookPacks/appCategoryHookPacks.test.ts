import { describe, expect, it } from "vitest";
import { appCategoryHookPacks } from "@/lib/clipstitchr/tools/appCategoryHookPacks/appCategoryHookPacks";

describe("appCategoryHookPacks", () => {
  it("contains 60 distinct fill-in structures", () => {
    expect(appCategoryHookPacks).toHaveLength(60);
    expect(new Set(appCategoryHookPacks.map((item) => item.id)).size).toBe(60);
    expect(new Set(appCategoryHookPacks.map((item) => item.title)).size).toBe(
      60,
    );
    expect(
      new Set(appCategoryHookPacks.map((item) => item.copyText)).size,
    ).toBe(60);
  });

  it("provides ten entries for every promised category pack", () => {
    const categoryCounts = Object.groupBy(
      appCategoryHookPacks,
      (item) => item.category,
    );

    expect(Object.keys(categoryCounts)).toEqual([
      "Fitness",
      "Finance",
      "Productivity",
      "Dating",
      "Education",
      "Utility",
    ]);
    expect(Object.values(categoryCounts).map((items) => items?.length)).toEqual(
      Array.from({ length: 6 }, () => 10),
    );
  });

  it("pairs every structure with an example and category reminder", () => {
    for (const item of appCategoryHookPacks) {
      expect(item.body).toContain("Example:");
      expect(item.body).toContain("Category reminder:");
      expect(item.copyText).toMatch(/\[[^\]]+\]/);
    }
  });
});
