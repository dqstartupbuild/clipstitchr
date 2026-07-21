import { describe, expect, it } from "vitest";
import { getHookLibraryPaginationPages } from "./getHookLibraryPaginationPages";

describe("getHookLibraryPaginationPages", () => {
  it("keeps the first, nearby, and last pages with compact gaps", () => {
    expect(getHookLibraryPaginationPages(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });

  it("does not add gaps to a short page range", () => {
    expect(getHookLibraryPaginationPages(2, 3)).toEqual([1, 2, 3]);
  });
});
