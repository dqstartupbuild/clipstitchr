import { describe, expect, it } from "vitest";
import { getPaginationState } from "@/lib/clipstitchr/utils/getPaginationState";

describe("getPaginationState", () => {
  it("returns a bounded first page for an empty collection", () => {
    expect(
      getPaginationState({ currentPage: 3, itemCount: 0, pageSize: 12 }),
    ).toMatchObject({
      currentPage: 1,
      totalPages: 1,
      visibleStart: 0,
      visibleEnd: 0,
      startIndex: 0,
      endIndex: 0,
    });
  });

  it("calculates visible indexes for a middle page", () => {
    expect(
      getPaginationState({ currentPage: 2, itemCount: 28, pageSize: 12 }),
    ).toMatchObject({
      currentPage: 2,
      totalPages: 3,
      visibleStart: 13,
      visibleEnd: 24,
      startIndex: 12,
      endIndex: 24,
      canGoPrevious: true,
      canGoNext: true,
    });
  });

  it("clamps a page past the available range", () => {
    expect(
      getPaginationState({ currentPage: 8, itemCount: 13, pageSize: 6 }),
    ).toMatchObject({
      currentPage: 3,
      totalPages: 3,
      visibleStart: 13,
      visibleEnd: 13,
      startIndex: 12,
      endIndex: 13,
      canGoPrevious: true,
      canGoNext: false,
    });
  });
});
