import { describe, expect, it } from "vitest";
import { createSwaprReferenceSegments } from "@/lib/clipstitchr/utils/createSwaprReferenceSegments";

describe("createSwaprReferenceSegments", () => {
  it("keeps clips at or below ten seconds as one segment", () => {
    expect(createSwaprReferenceSegments(10)).toEqual([{ start: 0, end: 10 }]);
  });

  it("splits longer clips into contiguous segments under the provider limit", () => {
    const segments = createSwaprReferenceSegments(21);

    expect(segments).toEqual([
      { start: 0, end: 7 },
      { start: 7, end: 14 },
      { start: 14, end: 21 },
    ]);
    expect(
      Math.max(...segments.map((segment) => segment.end - segment.start)),
    ).toBeLessThanOrEqual(10);
  });

  it("spreads the duration to avoid tiny tail segments", () => {
    expect(createSwaprReferenceSegments(10.5)).toEqual([
      { start: 0, end: 5.25 },
      { start: 5.25, end: 10.5 },
    ]);
  });
});
