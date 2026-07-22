import { describe, expect, it } from "vitest";
import { parseHookLabCreativeBrief } from "./parseHookLabCreativeBrief";

describe("parseHookLabCreativeBrief", () => {
  it("parses an editable product adaptation from a fenced model response", () => {
    const result = parseHookLabCreativeBrief(
      `Result:\n${JSON.stringify({
        adaptedCaption: "The task behind the slow morning.",
        adaptedConcept: "The quiet bottleneck",
        closingCta: "Try the saved workflow.",
        onScreenTextByScene: ["Scene 1: The task that eats your morning"],
        openingReaction: "Look at the full task list, then glance at the coffee.",
        productDemonstration: "Record the saved workflow completing the same task.",
        propsAndInteractions: ["Task list starts left of the coffee."],
        sceneBySceneDirections: ["0:00-0:02 | Name the problem", "0:02-0:05 | Show the workflow"],
        spokenLines: ["Scene 1: This part steals your morning."],
      })}`,
    );

    expect(result.directionName).toBe("The quiet bottleneck");
    expect(result.beatScript).toHaveLength(2);
    expect(result.productProof).toContain("saved workflow");
    expect(result.adaptedCaption).toContain("slow morning");
  });

  it("rejects an adaptation without a complete scene plan", () => {
    expect(() =>
      parseHookLabCreativeBrief(
        JSON.stringify({ sceneBySceneDirections: [], spokenLines: [] }),
      ),
    ).toThrow("missing its scene plan");
  });
});
