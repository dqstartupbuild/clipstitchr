import { describe, expect, it } from "vitest";
import { getHookLabCreativeBriefIsComplete } from "./getHookLabCreativeBriefIsComplete";

const brief = {
  beatScript: ["Problem", "Proof"],
  callToAction: "See the workflow.",
  directionName: "Morning reset",
  footageNeeds: ["Task list"],
  hook: "Your morning disappears here.",
  openingVisual: "A task list beside coffee.",
  productProof: "Show the saved workflow.",
  soundOffOverlay: "Where the morning goes",
};

describe("getHookLabCreativeBriefIsComplete", () => {
  it("accepts a complete editable brief", () => {
    expect(getHookLabCreativeBriefIsComplete(brief)).toBe(true);
  });

  it("rejects a brief with an empty required section", () => {
    expect(
      getHookLabCreativeBriefIsComplete({ ...brief, productProof: " " }),
    ).toBe(false);
  });
});
