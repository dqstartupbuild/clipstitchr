import { beforeEach, describe, expect, it, vi } from "vitest";
import { queuePostBridgeBatchItems } from "@/lib/clipstitchr/client/queuePostBridgeBatchItems";
import { schedulePostBridgePost } from "@/lib/clipstitchr/client/schedulePostBridgePost";
import type { PostBridgeBatchQueueItem } from "@/lib/clipstitchr/types/PostBridgeBatchQueueItem";

vi.mock("@/lib/clipstitchr/client/schedulePostBridgePost", () => ({
  schedulePostBridgePost: vi.fn(),
}));

function createItem(id: string): PostBridgeBatchQueueItem {
  return {
    caption: `Saved ${id}`,
    id,
    productId: "product_1",
    renderMedia: vi.fn(async ({ onProgress }) => {
      onProgress(0.5);
      return {
        hasAudio: false,
        mediaFiles: [
          {
            blob: new Blob([id], { type: "image/png" }),
            fileName: `${id}.png`,
            mediaKind: "image" as const,
          },
        ],
      };
    }),
    sourceType: "swipe",
    title: `Swipe ${id}`,
  };
}

describe("queuePostBridgeBatchItems", () => {
  beforeEach(() => {
    vi.mocked(schedulePostBridgePost).mockReset();
  });

  it("queues items sequentially with their own edited captions", async () => {
    const firstItem = createItem("one");
    const secondItem = createItem("two");
    const callOrder: string[] = [];
    vi.mocked(firstItem.renderMedia).mockImplementation(async () => {
      callOrder.push("render-one");
      return { hasAudio: false, mediaFiles: [{ blob: new Blob(), fileName: "one.png", mediaKind: "image" }] };
    });
    vi.mocked(secondItem.renderMedia).mockImplementation(async () => {
      callOrder.push("render-two");
      return { hasAudio: false, mediaFiles: [{ blob: new Blob(), fileName: "two.png", mediaKind: "image" }] };
    });
    vi.mocked(schedulePostBridgePost).mockImplementation(async (options) => {
      callOrder.push(`queue-${options.sourceId}`);
      return {} as Awaited<ReturnType<typeof schedulePostBridgePost>>;
    });

    await queuePostBridgeBatchItems({
      captions: ["Edited first", "Edited second"],
      items: [firstItem, secondItem],
      musicTrack: null,
      onCompletedCountChange: vi.fn(),
      onProgressChange: vi.fn(),
      platforms: ["instagram"],
      socialAccountIds: [12],
    });

    expect(callOrder).toEqual(["render-one", "queue-one", "render-two", "queue-two"]);
    expect(schedulePostBridgePost).toHaveBeenNthCalledWith(1, expect.objectContaining({ caption: "Edited first", sourceId: "one", useQueue: true }));
    expect(schedulePostBridgePost).toHaveBeenNthCalledWith(2, expect.objectContaining({ caption: "Edited second", sourceId: "two", useQueue: true }));
  });

  it("resumes at the first unfinished item", async () => {
    const firstItem = createItem("one");
    const secondItem = createItem("two");
    const thirdItem = createItem("three");

    await queuePostBridgeBatchItems({
      captions: ["First", "Second", "Third"],
      items: [firstItem, secondItem, thirdItem],
      musicTrack: null,
      onCompletedCountChange: vi.fn(),
      onProgressChange: vi.fn(),
      platforms: ["instagram"],
      socialAccountIds: [12],
      startIndex: 1,
    });

    expect(firstItem.renderMedia).not.toHaveBeenCalled();
    expect(secondItem.renderMedia).toHaveBeenCalledOnce();
    expect(thirdItem.renderMedia).toHaveBeenCalledOnce();
    expect(schedulePostBridgePost).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ sourceId: "two" }),
    );
    expect(schedulePostBridgePost).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ sourceId: "three" }),
    );
  });
});
