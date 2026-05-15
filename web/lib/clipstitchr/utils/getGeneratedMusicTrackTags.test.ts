import { describe, expect, it } from "vitest";
import { getGeneratedMusicTrackTags } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTags";

describe("getGeneratedMusicTrackTags", () => {
  it("can omit product-derived style tags", () => {
    expect(
      getGeneratedMusicTrackTags({
        includeStyleTags: false,
        source: "clipr",
        style: "Acme Skincare Launch",
      }),
    ).toEqual(["music", "ai", "clipr"]);
  });
});
