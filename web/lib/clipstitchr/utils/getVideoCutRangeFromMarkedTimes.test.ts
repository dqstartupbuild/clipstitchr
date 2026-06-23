import { describe, expect, it } from "vitest";
import { getVideoCutRangeFromMarkedTimes } from "@/lib/clipstitchr/utils/getVideoCutRangeFromMarkedTimes";

describe("getVideoCutRangeFromMarkedTimes", () => {
  it("creates a cut range from marked start and end times", () => {
    expect(
      getVideoCutRangeFromMarkedTimes({
        duration: 12,
        endSeconds: 7,
        startSeconds: 3,
      }),
    ).toEqual({
      end: 7,
      start: 3,
    });
  });

  it("orders reversed marks before returning the range", () => {
    expect(
      getVideoCutRangeFromMarkedTimes({
        duration: 12,
        endSeconds: 3,
        startSeconds: 7,
      }),
    ).toEqual({
      end: 7,
      start: 3,
    });
  });

  it("ignores marks that are too close together", () => {
    expect(
      getVideoCutRangeFromMarkedTimes({
        duration: 12,
        endSeconds: 3.05,
        startSeconds: 3,
      }),
    ).toBeNull();
  });
});
