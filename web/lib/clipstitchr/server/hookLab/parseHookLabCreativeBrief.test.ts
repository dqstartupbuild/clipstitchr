import { describe, expect, it } from "vitest";
import { parseHookLabCreativeBrief } from "./parseHookLabCreativeBrief";

describe("parseHookLabCreativeBrief", () => {
  it("parses an editable brief from a fenced model response", () => {
    const result = parseHookLabCreativeBrief(
      `Result:\n${JSON.stringify({
        beatScript: ["Name the problem", "Show the workflow"],
        callToAction: "Try the saved workflow.",
        directionName: "The quiet bottleneck",
        footageNeeds: ["Close view of the old workflow"],
        hook: "This part steals your morning.",
        openingVisual: "A full task list beside an untouched coffee.",
        productProof: "Record the saved workflow completing the same task.",
        soundOffOverlay: "The task that eats your morning",
      })}`,
    );

    expect(result.directionName).toBe("The quiet bottleneck");
    expect(result.beatScript).toHaveLength(2);
    expect(result.productProof).toContain("saved workflow");
  });

  it("rejects a brief without a shot plan", () => {
    expect(() =>
      parseHookLabCreativeBrief(
        JSON.stringify({ beatScript: [], footageNeeds: [] }),
      ),
    ).toThrow("missing its shot plan");
  });
});
