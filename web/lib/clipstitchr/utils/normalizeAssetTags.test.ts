import { describe, expect, it } from "vitest";
import { normalizeAssetTags } from "@/lib/clipstitchr/utils/normalizeAssetTags";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

describe("normalizeAssetTags", () => {
  it("normalizes, dedupes, and removes empty tags", () => {
    expect(
      normalizeAssetTags(["  Product Demo ", "#Product Demo", "", "UGC"]),
    ).toEqual(["product demo", "ugc"]);
  });

  it("limits tags to eight entries", () => {
    expect(
      normalizeAssetTags([
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
      ]),
    ).toEqual(["one", "two", "three", "four", "five", "six", "seven", "eight"]);
  });

  it("keeps a required tag first", () => {
    expect(
      normalizeAssetTagsWithRequiredTag(
        ["one", "two", "three", "four", "five", "six", "seven", "eight"],
        "demo",
      ),
    ).toEqual(["demo", "one", "two", "three", "four", "five", "six", "seven"]);
  });
});
