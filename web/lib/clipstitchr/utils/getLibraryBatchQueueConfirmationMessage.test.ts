import { describe, expect, it } from "vitest";
import { getLibraryBatchQueueConfirmationMessage } from "@/lib/clipstitchr/utils/getLibraryBatchQueueConfirmationMessage";

describe("getLibraryBatchQueueConfirmationMessage", () => {
  it("uses singular and plural labels", () => {
    expect(
      getLibraryBatchQueueConfirmationMessage({
        count: 1,
        itemName: "stitch",
        itemPluralName: "stitches",
      }),
    ).toBe("Add 1 stitch to your Post Bridge queue?");
    expect(
      getLibraryBatchQueueConfirmationMessage({
        count: 3,
        itemName: "stitch",
        itemPluralName: "stitches",
      }),
    ).toBe("Add 3 stitches to your Post Bridge queue?");
  });
});
