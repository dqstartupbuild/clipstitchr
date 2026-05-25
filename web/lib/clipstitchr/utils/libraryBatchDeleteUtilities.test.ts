import { describe, expect, it, vi } from "vitest";
import { deleteLibraryItems } from "@/lib/clipstitchr/utils/deleteLibraryItems";
import { getLibraryBatchDeleteConfirmationMessage } from "@/lib/clipstitchr/utils/getLibraryBatchDeleteConfirmationMessage";

describe("library batch delete utilities", () => {
  it("builds singular and plural confirmation messages", () => {
    expect(
      getLibraryBatchDeleteConfirmationMessage({
        count: 1,
        itemName: "video",
        itemPluralName: "videos",
      }),
    ).toBe("Delete 1 selected video?\n\nThis cannot be undone.");
    expect(
      getLibraryBatchDeleteConfirmationMessage({
        count: 3,
        itemName: "stitch",
        itemPluralName: "stitches",
      }),
    ).toBe("Delete 3 selected stitches?\n\nThis cannot be undone.");
  });

  it("deletes library items in selection order", async () => {
    const onDelete = vi.fn(async () => undefined);

    await deleteLibraryItems(["clip_1", "clip_2", "clip_3"], onDelete);

    expect(onDelete).toHaveBeenNthCalledWith(1, "clip_1");
    expect(onDelete).toHaveBeenNthCalledWith(2, "clip_2");
    expect(onDelete).toHaveBeenNthCalledWith(3, "clip_3");
  });
});
