import { describe, expect, it } from "vitest";
import { defaultHookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/defaultHookVisualMatchmakerInput";
import { matchHookToVisual } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/matchHookToVisual";

describe("matchHookToVisual", () => {
  it("creates a three-beat five-second plan from available footage", () => {
    const result = matchHookToVisual(defaultHookVisualMatchmakerInput);

    expect(result.primary.storyboard).toHaveLength(3);
    expect(result.primary.storyboard.map((beat) => beat.timeRange)).toEqual([
      "0–1.5 sec",
      "1.5–3 sec",
      "3–5 sec",
    ]);
    expect(result.primary.openingSource).toBe("demo");
    expect(result.alternate.openingSource).toBe("ugc");
    expect(result.primary.openingShot).toContain(
      defaultHookVisualMatchmakerInput.demoMoment,
    );
  });

  it("honors an available requested source and adapts when it is missing", () => {
    const demoFirst = matchHookToVisual({
      ...defaultHookVisualMatchmakerInput,
      preferredOpening: "demo",
    });
    const missingDemo = matchHookToVisual({
      ...defaultHookVisualMatchmakerInput,
      demoMoment: "",
      preferredOpening: "demo",
    });

    expect(demoFirst.primary.openingSource).toBe("demo");
    expect(missingDemo.primary.openingSource).toBe("ugc");
    expect(missingDemo.primary.demoHandoff).toContain("No demo moment was provided");
  });

  it("never pretends footage exists and flags claims that need proof", () => {
    const result = matchHookToVisual({
      ...defaultHookVisualMatchmakerInput,
      demoMoment: "",
      hook: "Guaranteed 100% results instantly",
      ugcFootage: "",
    });

    expect(result.primary.openingSource).toBe("text-card");
    expect(result.primary.openingShot).toContain("do not pretend");
    expect(result.claimNotice).toContain("visible support");
    expect(result.alternate.openingShot).toContain("Alternate treatment");
  });
});
