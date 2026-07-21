import { describe, expect, it } from "vitest";
import { assertHookLabCreativeBriefIsOriginal } from "./assertHookLabCreativeBriefIsOriginal";

const brief = {
  beatScript: ["Name the morning bottleneck", "Show the saved workflow"],
  callToAction: "See how the workflow fits your morning.",
  directionName: "Morning reset",
  footageNeeds: ["A real task list"],
  hook: "Your morning disappears inside this one task.",
  openingVisual: "Coffee beside a task list.",
  productProof: "Record the saved workflow doing the supported task.",
  soundOffOverlay: "Where your morning goes",
};

describe("assertHookLabCreativeBriefIsOriginal", () => {
  it("accepts a structurally similar brief with original wording", () => {
    expect(() =>
      assertHookLabCreativeBriefIsOriginal({
        brief,
        sourcePhrases: ["I cannot believe this cleaning trick actually worked"],
      }),
    ).not.toThrow();
  });

  it("rejects copied source wording", () => {
    expect(() =>
      assertHookLabCreativeBriefIsOriginal({
        brief: {
          ...brief,
          hook: "I cannot believe this cleaning trick actually worked",
        },
        sourcePhrases: ["I cannot believe this cleaning trick actually worked"],
      }),
    ).toThrow("too close to the source wording");
  });
});
