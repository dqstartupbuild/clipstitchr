import { describe, expect, it } from "vitest";
import { createThirtyDayContentPlan } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/createThirtyDayContentPlan";
import { defaultThirtyDayContentPlanInput } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/defaultThirtyDayContentPlanInput";
import { formatThirtyDayContentPlanMarkdown } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/formatThirtyDayContentPlanMarkdown";

describe("createThirtyDayContentPlan", () => {
  it.each([2, 3, 5] as const)(
    "creates exactly thirty dated useful actions at %i posts per week",
    (postsPerWeek) => {
      const actions = createThirtyDayContentPlan({
        ...defaultThirtyDayContentPlanInput,
        postsPerWeek,
      });

      expect(actions).toHaveLength(30);
      expect(actions[0]?.date).toBe("2026-01-05");
      expect(actions[29]?.date).toBe("2026-02-03");
      expect(new Set(actions.map((action) => action.date)).size).toBe(30);
      expect(actions.every((action) => action.detail.length > 40)).toBe(true);
      expect(new Set(actions.map((action) => action.kind))).toEqual(
        new Set(["publish", "production", "repurpose", "review"]),
      );
    },
  );

  it("changes the plan with the visitor goal and available assets", () => {
    const actions = createThirtyDayContentPlan({
      ...defaultThirtyDayContentPlanInput,
      goal: "retention",
      hasDemo: false,
      hasScreenshots: false,
      hasUgc: false,
      cameraComfort: "off-camera",
    });
    const markdown = formatThirtyDayContentPlanMarkdown(actions);

    expect(markdown).toContain("Teach a repeatable habit");
    expect(markdown).toContain("text-led post with one product fact");
    expect(markdown.match(/^## Day /gm)).toHaveLength(30);
  });
});
