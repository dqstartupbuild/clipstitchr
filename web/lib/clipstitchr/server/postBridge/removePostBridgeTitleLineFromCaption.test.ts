import { describe, expect, it } from "vitest";
import { removePostBridgeTitleLineFromCaption } from "@/lib/clipstitchr/server/postBridge/removePostBridgeTitleLineFromCaption";

describe("removePostBridgeTitleLineFromCaption", () => {
  it("removes the first non-empty caption line when it matches the post title", () => {
    expect(
      removePostBridgeTitleLineFromCaption({
        caption: "\n\nSkinny-fat is solvable.\n\nHere is the body.\n\n#fitness",
        title: "Skinny-fat is solvable.",
      }),
    ).toBe("Here is the body.\n\n#fitness");
  });

  it("keeps the caption when the first content line does not match the title", () => {
    expect(
      removePostBridgeTitleLineFromCaption({
        caption: "A different opening.\n\nHere is the body.",
        title: "Original title.",
      }),
    ).toBe("A different opening.\n\nHere is the body.");
  });

  it("removes a title line when the scheduled post title was truncated", () => {
    const longTitleLine = `${"a".repeat(105)} ending`;

    expect(
      removePostBridgeTitleLineFromCaption({
        caption: `${longTitleLine}\n\nBody after a long title.`,
        title: "a".repeat(100),
      }),
    ).toBe("Body after a long title.");
  });
});
