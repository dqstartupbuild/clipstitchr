import { describe, expect, it } from "vitest";
import { getGeneratedMusicTrackTitle } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTitle";

describe("getGeneratedMusicTrackTitle", () => {
  it("does not expose product or tool names in generated titles", () => {
    const title = getGeneratedMusicTrackTitle({
      source: "clipr",
      style: "Acme Skincare Launch",
      trackId: "track_123",
    });

    expect(title).not.toMatch(/acme|skincare|launch|clipr/i);
  });

  it("is stable for the same generated track", () => {
    const options = {
      source: "stitchr" as const,
      style: "Holiday Demo Stitch",
      trackId: "track_456",
    };

    expect(getGeneratedMusicTrackTitle(options)).toBe(
      getGeneratedMusicTrackTitle(options),
    );
  });
});
