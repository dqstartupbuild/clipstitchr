import { describe, expect, it } from "vitest";
import { getHookLabCreativeBriefDirection } from "./getHookLabCreativeBriefDirection";

describe("getHookLabCreativeBriefDirection", () => {
  it("carries every editable brief field into a destination prompt", () => {
    const result = getHookLabCreativeBriefDirection({
      beatScript: ["Problem", "Proof"],
      callToAction: "See the workflow.",
      directionName: "Morning reset",
      footageNeeds: ["Task list"],
      hook: "Your morning disappears here.",
      openingVisual: "Untouched coffee beside a task list.",
      productProof: "Show the saved workflow.",
      soundOffOverlay: "Where the morning goes",
    });

    expect(result).toContain("Morning reset");
    expect(result).toContain("Beats: Problem | Proof");
    expect(result).toContain("CTA: See the workflow.");
  });
});
