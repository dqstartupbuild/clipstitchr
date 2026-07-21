import { describe, expect, it } from "vitest";
import { readHookLabSourceStringArray } from "./readHookLabSourceStringArray";

describe("readHookLabSourceStringArray", () => {
  it("reads strings through nested object arrays and removes duplicates", () => {
    expect(
      readHookLabSourceStringArray(
        {
          childPosts: [{ displayUrl: " one " }, { displayUrl: "two" }],
          images: ["two", "three"],
        },
        ["childPosts.displayUrl", "images"],
      ),
    ).toEqual(["one", "two", "three"]);
  });
});
