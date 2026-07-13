import { describe, expect, it } from "vitest";
import { defaultAppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/defaultAppAdHookGraderInput";
import { gradeAppAdHook } from "@/lib/clipstitchr/tools/appAdHookGrader/gradeAppAdHook";

describe("gradeAppAdHook", () => {
  it("scores six transparent dimensions and keeps the average bounded", () => {
    const result = gradeAppAdHook(defaultAppAdHookGraderInput);
    const average = Math.round(
      result.dimensions.reduce((sum, item) => sum + item.score, 0) /
        result.dimensions.length,
    );

    expect(result.dimensions).toHaveLength(6);
    expect(result.overallScore).toBe(average);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.fixes).toHaveLength(3);
  });

  it("scores a specific readable hook above vague all-caps hype", () => {
    const strong = gradeAppAdHook(defaultAppAdHookGraderInput);
    const vague = gradeAppAdHook({
      ...defaultAppAdHookGraderInput,
      firstVisual: "",
      hook: "THIS AMAZING GAME CHANGER WILL LEVEL UP EVERYTHING!!!!",
    });

    expect(strong.overallScore).toBeGreaterThan(vague.overallScore);
  });

  it("flags numeric, absolute, authority, and regulated claims", () => {
    const result = gradeAppAdHook({
      ...defaultAppAdHookGraderInput,
      hook: "Doctors guarantee this app will cure debt 100% instantly",
    });
    const claimScore = result.dimensions.find(
      (dimension) => dimension.key === "claim-safety",
    );

    expect(result.claimSignals.map((signal) => signal.kind)).toEqual([
      "numeric",
      "absolute",
      "authority",
      "regulated",
    ]);
    expect(claimScore?.score).toBe(0);
  });

  it("does not treat an ordinary time of day as a performance claim", () => {
    const result = gradeAppAdHook(defaultAppAdHookGraderInput);

    expect(result.claimSignals).toEqual([]);
  });
});
