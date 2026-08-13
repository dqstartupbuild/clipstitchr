import { describe, expect, it } from "vitest";
import { countPublishingYouTubeTagCharacters } from "@/lib/clipstitchr/publishing/client/countPublishingYouTubeTagCharacters";

describe("countPublishingYouTubeTagCharacters", () => {
  it("adds two official characters for every tag containing whitespace", () => {
    expect(
      countPublishingYouTubeTagCharacters(["camera", "camera setup", "vertical\tvideo"]),
    ).toBe(6 + 14 + 16);
  });
});
