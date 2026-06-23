import { describe, expect, it } from "vitest";
import { getTimelineSecondsFromPointer } from "@/lib/clipstitchr/utils/getTimelineSecondsFromPointer";

describe("getTimelineSecondsFromPointer", () => {
  it("maps a pointer position to clip seconds", () => {
    expect(
      getTimelineSecondsFromPointer({
        clientX: 150,
        duration: 20,
        left: 50,
        width: 200,
      }),
    ).toBe(10);
  });

  it("clamps positions outside the timeline", () => {
    expect(
      getTimelineSecondsFromPointer({
        clientX: 0,
        duration: 20,
        left: 50,
        width: 200,
      }),
    ).toBe(0);
    expect(
      getTimelineSecondsFromPointer({
        clientX: 300,
        duration: 20,
        left: 50,
        width: 200,
      }),
    ).toBe(20);
  });

  it("returns zero for empty timelines", () => {
    expect(
      getTimelineSecondsFromPointer({
        clientX: 150,
        duration: 20,
        left: 50,
        width: 0,
      }),
    ).toBe(0);
    expect(
      getTimelineSecondsFromPointer({
        clientX: 150,
        duration: 0,
        left: 50,
        width: 200,
      }),
    ).toBe(0);
  });
});
