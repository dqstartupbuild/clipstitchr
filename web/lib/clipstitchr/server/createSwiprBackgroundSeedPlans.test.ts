import { describe, expect, it } from "vitest";
import { swiprBackgroundSeedNiches } from "@/lib/clipstitchr/constants/swiprBackgroundSeedNiches";
import { swiprBackgroundSeedStyles } from "@/lib/clipstitchr/constants/swiprBackgroundSeedStyles";
import { createSwiprBackgroundSeedPlans } from "@/lib/clipstitchr/server/createSwiprBackgroundSeedPlans";

describe("createSwiprBackgroundSeedPlans", () => {
  it("creates exactly 1,000 searchable seed plans", () => {
    const seedPlans = createSwiprBackgroundSeedPlans();
    const ids = new Set(seedPlans.map((plan) => plan.id));

    expect(swiprBackgroundSeedNiches).toHaveLength(25);
    expect(swiprBackgroundSeedStyles).toHaveLength(8);
    expect(
      swiprBackgroundSeedNiches.every((niche) => niche.settings.length === 5),
    ).toBe(true);
    expect(seedPlans).toHaveLength(1_000);
    expect(ids.size).toBe(seedPlans.length);
  });

  it("prefills the metadata used by background search", () => {
    const seedPlans = createSwiprBackgroundSeedPlans();
    const fitnessPlan = seedPlans.find(
      (plan) =>
        plan.nicheId === "fitness-training" &&
        plan.styleId === "realistic-ugc" &&
        plan.settingId === "scene-01",
    );

    expect(fitnessPlan).toEqual(
      expect.objectContaining({
        category: "fitness",
        source: "seed",
        presetId: "countertop",
      }),
    );
    expect(fitnessPlan?.name).toContain("Fitness Training");
    expect(fitnessPlan?.description).toContain("fitness programs");
    expect(fitnessPlan?.details).toContain("Seed metadata");
    expect(fitnessPlan?.details).toContain("Search tags");
    expect(fitnessPlan?.tags).toEqual(
      expect.arrayContaining(["seed", "fitness", "gym", "realistic-ugc"]),
    );
  });

  it("builds provider-ready prompts with empty-background constraints", () => {
    const [seedPlan] = createSwiprBackgroundSeedPlans();

    expect(seedPlan?.prompt).toContain("vertical 9:16 portrait");
    expect(seedPlan?.prompt).toContain("center and upper third open");
    expect(seedPlan?.prompt).toContain("Do not include visible words");
    expect(seedPlan?.prompt).toContain("people");
    expect(seedPlan?.prompt).toContain("product packaging");
  });

  it("keeps saved metadata within Convex background limits", () => {
    const seedPlans = createSwiprBackgroundSeedPlans();

    expect(
      seedPlans.every(
        (plan) =>
          plan.name.length <= 120 &&
          plan.description.length <= 1_200 &&
          plan.details.length <= 3_000 &&
          plan.tags.every((tag) => tag === tag.toLowerCase()),
      ),
    ).toBe(true);
  });
});
