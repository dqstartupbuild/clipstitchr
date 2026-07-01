import { describe, expect, it } from "vitest";
import { getReadLimitedPaginationOpts } from "./getReadLimitedPaginationOpts";

describe("getReadLimitedPaginationOpts", () => {
  it("adds row and byte ceilings to pagination options", () => {
    expect(
      getReadLimitedPaginationOpts({
        cursor: null,
        numItems: 24,
      }),
    ).toEqual({
      cursor: null,
      numItems: 24,
      maximumRowsRead: 120,
      maximumBytesRead: 524288,
    });
  });

  it("keeps tighter caller-provided ceilings", () => {
    expect(
      getReadLimitedPaginationOpts({
        cursor: null,
        numItems: 12,
        maximumRowsRead: 40,
        maximumBytesRead: 1000,
      }),
    ).toEqual({
      cursor: null,
      numItems: 12,
      maximumRowsRead: 40,
      maximumBytesRead: 1000,
    });
  });
});
