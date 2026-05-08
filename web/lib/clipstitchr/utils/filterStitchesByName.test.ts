import { describe, expect, it } from "vitest";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { filterStitchesByName } from "@/lib/clipstitchr/utils/filterStitchesByName";

const stitches = [
  { id: "stitch-1", name: "Morning Unboxing Demo" },
  { id: "stitch-2", name: "Launch Walkthrough" },
  { id: "stitch-3", name: "Night Reaction Export" },
] as Stitch[];

describe("filterStitchesByName", () => {
  it("matches stitch names case-insensitively", () => {
    expect(filterStitchesByName(stitches, "launch")).toEqual([
      stitches[1],
    ]);
  });

  it("trims whitespace before matching", () => {
    expect(filterStitchesByName(stitches, " EXPORT ")).toEqual([
      stitches[2],
    ]);
  });

  it("returns all stitches when the query is blank", () => {
    expect(filterStitchesByName(stitches, "   ")).toEqual(
      stitches,
    );
  });
});
