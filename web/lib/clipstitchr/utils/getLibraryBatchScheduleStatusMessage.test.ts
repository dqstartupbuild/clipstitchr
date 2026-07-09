import { describe, expect, it } from "vitest";
import { getLibraryBatchScheduleStatusMessage } from "@/lib/clipstitchr/utils/getLibraryBatchScheduleStatusMessage";

describe("getLibraryBatchScheduleStatusMessage", () => {
  it("shows active review progress before completion copy", () => {
    expect(
      getLibraryBatchScheduleStatusMessage({
        activeIndex: 1,
        itemName: "stitch",
        itemPluralName: "stitches",
        scheduledCount: 1,
        totalCount: 3,
      }),
    ).toBe("Reviewing 2 of 3.");
  });

  it("uses singular and plural completion copy", () => {
    expect(
      getLibraryBatchScheduleStatusMessage({
        activeIndex: 0,
        itemName: "stitch",
        itemPluralName: "stitches",
        scheduledCount: 1,
        totalCount: 0,
      }),
    ).toBe("Finished 1 stitch.");
    expect(
      getLibraryBatchScheduleStatusMessage({
        activeIndex: 0,
        itemName: "stitch",
        itemPluralName: "stitches",
        scheduledCount: 2,
        totalCount: 0,
      }),
    ).toBe("Finished 2 stitches.");
  });
});
