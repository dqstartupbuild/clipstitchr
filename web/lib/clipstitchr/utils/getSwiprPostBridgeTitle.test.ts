import { describe, expect, it } from "vitest";
import { getSwiprPostBridgeTitle } from "@/lib/clipstitchr/utils/getSwiprPostBridgeTitle";

describe("getSwiprPostBridgeTitle", () => {
  it("uses the first non-empty line from the combined Swipe post copy", () => {
    expect(
      getSwiprPostBridgeTitle({
        caption: "Ignored caption",
        description: "Ignored description",
        hashtags: ["#ignored"],
        name: "Launch Kit carousel",
        socialCaption:
          "\n\nSkinny-fat is solvable. The gym just usually isn't the solution.\n\nBody copy.",
      }),
    ).toBe("Skinny-fat is solvable. The gym just usually isn't the solution.");
  });

  it("combines structured Swipe copy when the saved combined copy is missing", () => {
    expect(
      getSwiprPostBridgeTitle({
        caption: "Build the habit first.",
        description: "Then make it easier to repeat.",
        hashtags: ["#habits"],
        name: "Habit app carousel",
      }),
    ).toBe("Build the habit first.");
  });

  it("falls back to the Swipe name when only hashtags are available", () => {
    expect(
      getSwiprPostBridgeTitle({
        caption: "",
        description: "",
        hashtags: ["#launch", "#apps"],
        name: "Launch Kit carousel",
        socialCaption: "#launch #apps",
      }),
    ).toBe("Launch Kit carousel");
  });
});
