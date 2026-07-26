import { describe, expect, it } from "vitest";
import { getStitchrHookMatchesAssignedOpener } from "@/lib/clipstitchr/server/getStitchrHookMatchesAssignedOpener";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";

function createTemplate(id: string): CliprHookTemplate {
  return {
    active: true,
    allowedPurposes: ["stitchr"],
    bestFor: [],
    emotionalTrigger: "recognition",
    id,
    requiredVariables: ["problem"],
    riskLevel: "safe",
    source: "ugc_discovery_patterns",
    styleKey: "vulnerable_reveal",
    template: "placeholder",
  };
}

describe("getStitchrHookMatchesAssignedOpener", () => {
  it("accepts the assigned opener despite punctuation and case differences", () => {
    expect(
      getStitchrHookMatchesAssignedOpener({
        hook: "HOLD ON... SO random workouts were never a plan",
        template: createTemplate("UGD-120"),
      }),
    ).toBe(true);
  });

  it("rejects a repeated not-me opener assigned to another lane", () => {
    expect(
      getStitchrHookMatchesAssignedOpener({
        hook: "not me realizing random workouts were never a plan",
        template: createTemplate("UGD-120"),
      }),
    ).toBe(false);
  });

  it("does not let a longer opener pass a shorter assigned lane", () => {
    const hook = "not me discovering random workouts were never a plan";

    expect(
      getStitchrHookMatchesAssignedOpener({
        hook,
        template: createTemplate("UGD-001"),
      }),
    ).toBe(false);
    expect(
      getStitchrHookMatchesAssignedOpener({
        hook,
        template: createTemplate("UGD-180"),
      }),
    ).toBe(true);
  });

  it("distinguishes overlapping I-fear opener lanes", () => {
    const hook = "I fear I am making the starting point too complicated";

    expect(
      getStitchrHookMatchesAssignedOpener({
        hook,
        template: createTemplate("UGD-191"),
      }),
    ).toBe(false);
    expect(
      getStitchrHookMatchesAssignedOpener({
        hook,
        template: createTemplate("UGD-051"),
      }),
    ).toBe(true);
  });
});
