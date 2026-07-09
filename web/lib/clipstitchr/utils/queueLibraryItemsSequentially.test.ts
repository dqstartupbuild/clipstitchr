import { describe, expect, it, vi } from "vitest";
import { queueLibraryItemsSequentially } from "@/lib/clipstitchr/utils/queueLibraryItemsSequentially";

describe("queueLibraryItemsSequentially", () => {
  it("queues items in order and reports completed progress", async () => {
    const queuedItems: string[] = [];
    const progress = vi.fn();

    await queueLibraryItemsSequentially({
      items: ["one", "two", "three"],
      onProgress: progress,
      onQueue: async (item) => {
        queuedItems.push(item);
      },
    });

    expect(queuedItems).toEqual(["one", "two", "three"]);
    expect(progress).toHaveBeenNthCalledWith(1, 1, 3, "one");
    expect(progress).toHaveBeenNthCalledWith(2, 2, 3, "two");
    expect(progress).toHaveBeenNthCalledWith(3, 3, 3, "three");
  });

  it("stops when an item fails", async () => {
    const queuedItems: string[] = [];

    await expect(
      queueLibraryItemsSequentially({
        items: ["one", "two", "three"],
        onQueue: async (item) => {
          queuedItems.push(item);

          if (item === "two") {
            throw new Error("Queue failed.");
          }
        },
      }),
    ).rejects.toThrow("Queue failed.");

    expect(queuedItems).toEqual(["one", "two"]);
  });
});
