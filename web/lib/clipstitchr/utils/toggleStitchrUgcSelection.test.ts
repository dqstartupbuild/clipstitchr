import { describe, expect, it } from "vitest";
import { toggleStitchrUgcSelection } from "@/lib/clipstitchr/utils/toggleStitchrUgcSelection";

describe("toggleStitchrUgcSelection", () => {
  it("adds an unselected clip", () => {
    expect(toggleStitchrUgcSelection(["ugc-1"], "ugc-2", 3)).toEqual([
      "ugc-1",
      "ugc-2",
    ]);
  });

  it("removes a selected clip", () => {
    expect(toggleStitchrUgcSelection(["ugc-1", "ugc-2"], "ugc-1", 3)).toEqual([
      "ugc-2",
    ]);
  });

  it("keeps the current selection when the cap is reached", () => {
    expect(toggleStitchrUgcSelection(["ugc-1", "ugc-2"], "ugc-3", 2)).toEqual([
      "ugc-1",
      "ugc-2",
    ]);
  });
});
