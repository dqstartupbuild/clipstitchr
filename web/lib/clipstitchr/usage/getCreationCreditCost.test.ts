import { describe, expect, it } from "vitest";
import { getCreationCreditCost } from "@/lib/clipstitchr/usage/getCreationCreditCost";
import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";
import type { UsageOperation } from "@/lib/clipstitchr/usage/types/UsageOperation";

describe("getCreationCreditCost", () => {
  const plans: PlanKey[] = ["starter", "pro", "agency"];
  const standalonePhotoOperations: UsageOperation[] = [
    "avatar_photo",
    "background_photo",
    "photo_expansion",
  ];

  it("charges stitches by plan and keeps Agency stitches unlimited", () => {
    expect(plans.map((planKey) => getCreationCreditCost(planKey, "stitch"))).toEqual([
      10,
      10,
      0,
    ]);
  });

  it("charges every plan 20 credits for Swipr", () => {
    expect(plans.map((planKey) => getCreationCreditCost(planKey, "swipr"))).toEqual([
      20,
      20,
      20,
    ]);
  });

  it("charges every standalone photo operation exactly 25 credits", () => {
    for (const operation of standalonePhotoOperations) {
      expect(plans.map((planKey) => getCreationCreditCost(planKey, operation))).toEqual([
        25,
        25,
        25,
      ]);
    }
  });

  it("does not deduct creation credits for Clipr or Swapr videos", () => {
    for (const operation of ["clipr_video", "swapr_video"] as const) {
      expect(plans.map((planKey) => getCreationCreditCost(planKey, operation))).toEqual([
        0,
        0,
        0,
      ]);
    }
  });

  it("charges one credit for AI and Hook Lab analysis", () => {
    for (const planKey of ["starter", "pro", "agency"] as const) {
      expect(getCreationCreditCost(planKey, "ai_analysis")).toBe(1);
      expect(getCreationCreditCost(planKey, "hook_lab_analysis")).toBe(1);
    }
  });
});
