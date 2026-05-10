import { describe, expect, it } from "vitest";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";

describe("getVideoTrimDisplayDuration", () => {
  it("uses the selected trim duration when it is shorter than the clip", () => {
    expect(
      getVideoTrimDisplayDuration(20, {
        start: 4,
        end: 12,
      }),
    ).toBe(8);
  });

  it("keeps the clip duration when no trim range is provided", () => {
    expect(getVideoTrimDisplayDuration(20)).toBe(20);
  });

  it("never displays a duration longer than the clip", () => {
    expect(
      getVideoTrimDisplayDuration(20, {
        start: 0,
        end: 30,
      }),
    ).toBe(20);
  });
});
