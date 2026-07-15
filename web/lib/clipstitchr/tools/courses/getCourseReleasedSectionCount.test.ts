import { describe, expect, it } from "vitest";
import { getCourseReleasedSectionCount } from "@/lib/clipstitchr/tools/courses/getCourseReleasedSectionCount";

describe("getCourseReleasedSectionCount", () => {
  it("releases one sprint section per 24-hour boundary", () => {
    const activatedAt = 1_000_000;
    const dayMs = 24 * 60 * 60 * 1_000;

    expect(
      getCourseReleasedSectionCount({
        activatedAt,
        courseKey: "five-day-app-content-sprint",
        evaluatedAt: activatedAt,
        sectionCount: 5,
      }),
    ).toBe(1);
    expect(
      getCourseReleasedSectionCount({
        activatedAt,
        courseKey: "five-day-app-content-sprint",
        evaluatedAt: activatedAt + dayMs - 1,
        sectionCount: 5,
      }),
    ).toBe(1);
    expect(
      getCourseReleasedSectionCount({
        activatedAt,
        courseKey: "five-day-app-content-sprint",
        evaluatedAt: activatedAt + dayMs,
        sectionCount: 5,
      }),
    ).toBe(2);
  });

  it("caps a mini-course at its section count", () => {
    expect(
      getCourseReleasedSectionCount({
        activatedAt: 1,
        courseKey: "ugc-to-app-ad-mini-course",
        evaluatedAt: Number.MAX_SAFE_INTEGER,
        sectionCount: 5,
      }),
    ).toBe(5);
  });

  it("releases the complete workshop immediately", () => {
    expect(
      getCourseReleasedSectionCount({
        activatedAt: 5_000,
        courseKey: "app-creative-testing-system-workshop",
        evaluatedAt: 5_000,
        sectionCount: 7,
      }),
    ).toBe(7);
  });

  it("releases nothing before activation", () => {
    expect(
      getCourseReleasedSectionCount({
        activatedAt: 5_000,
        courseKey: "five-day-app-content-sprint",
        evaluatedAt: 4_999,
        sectionCount: 5,
      }),
    ).toBe(0);
  });
});
