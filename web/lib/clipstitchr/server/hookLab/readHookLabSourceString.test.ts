import { describe, expect, it } from "vitest";
import { readHookLabSourceString } from "@/lib/clipstitchr/server/hookLab/readHookLabSourceString";

describe("readHookLabSourceString", () => {
  it("reads the first usable nested string, number, or string-array item", () => {
    expect(
      readHookLabSourceString(
        { author: { username: " creator " } },
        ["missing", "author.username"],
      ),
    ).toBe("creator");
    expect(readHookLabSourceString({ id: 123 }, ["id"])).toBe("123");
    expect(readHookLabSourceString({ media: ["", " video.mp4 "] }, ["media"])).toBe(
      "video.mp4",
    );
  });

  it("omits unsupported or empty values", () => {
    expect(readHookLabSourceString({ value: false }, ["value"])).toBeUndefined();
    expect(readHookLabSourceString({ value: "   " }, ["value"])).toBeUndefined();
  });
});
