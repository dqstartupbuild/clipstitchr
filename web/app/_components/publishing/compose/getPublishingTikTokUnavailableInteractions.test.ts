import { describe, expect, it } from "vitest";
import { getPublishingTikTokUnavailableInteractions } from "./getPublishingTikTokUnavailableInteractions";

describe("getPublishingTikTokUnavailableInteractions", () => {
  it("names only interactions disabled by the connected account", () => {
    expect(
      getPublishingTikTokUnavailableInteractions({
        commentsDisabled: true,
        duetDisabled: false,
        stitchDisabled: true,
      }),
    ).toEqual(["comments", "Stitch"]);
  });
});
