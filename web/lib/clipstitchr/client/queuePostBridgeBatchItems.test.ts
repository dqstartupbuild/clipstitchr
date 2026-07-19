import { beforeEach, describe, expect, it, vi } from "vitest";
import { queuePostBridgeBatchItems } from "@/lib/clipstitchr/client/queuePostBridgeBatchItems";
import { submitPostBridgeBatch } from "@/lib/clipstitchr/client/submitPostBridgeBatch";
import { uploadPostBridgeBatchMediaFile } from "@/lib/clipstitchr/client/uploadPostBridgeBatchMediaFile";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import type { PostBridgeBatchQueueItem } from "@/lib/clipstitchr/types/PostBridgeBatchQueueItem";

vi.mock("@/lib/clipstitchr/client/submitPostBridgeBatch", () => ({
  submitPostBridgeBatch: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/uploadPostBridgeBatchMediaFile", () => ({
  uploadPostBridgeBatchMediaFile: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: vi.fn(async () => undefined),
}));

vi.mock("@/lib/clipstitchr/utils/shufflePostBridgeBatchEntries", () => ({
  shufflePostBridgeBatchEntries: <Entry,>(entries: Entry[]) => entries,
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
    vi.mocked(submitPostBridgeBatch).mockReset();
    vi.mocked(uploadPostBridgeBatchMediaFile).mockReset();
    vi.mocked(deleteObjectsFromR2).mockClear();
    vi.mocked(uploadPostBridgeBatchMediaFile).mockImplementation(
      async ({ mediaFile, sourceId }) => ({
        media: {
          mediaKind: mediaFile.mediaKind,
          mimeType: mediaFile.blob.type,
          name: mediaFile.fileName,
          sizeBytes: mediaFile.blob.size,
        },
        sourceObject: {
          contentType: mediaFile.blob.type,
          key: `users/user_1/post-bridge-media/${sourceId}`,
          size: mediaFile.blob.size,
        },
      }),
    );
  });

  it("prepares each item and submits one background batch", async () => {
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
    vi.mocked(uploadPostBridgeBatchMediaFile).mockImplementation(async (options) => {
      callOrder.push(`upload-${options.sourceId}`);
      return {
        media: {
          mediaKind: options.mediaFile.mediaKind,
          mimeType: "image/png",
          name: options.mediaFile.fileName,
          sizeBytes: 1,
        },
        sourceObject: {
          contentType: "image/png",
          key: `users/user_1/post-bridge-media/${options.sourceId}`,
          size: 1,
        },
      };
    });
    vi.mocked(submitPostBridgeBatch).mockImplementation(async () => {
      callOrder.push("submit-batch");
      return { jobId: "provider:post-bridge-batch:1" };
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

    expect(callOrder).toEqual([
      "render-one",
      "upload-one",
      "render-two",
      "upload-two",
      "submit-batch",
    ]);
    expect(submitPostBridgeBatch).toHaveBeenCalledWith({
      items: [
        expect.objectContaining({ caption: "Edited first", sourceId: "one" }),
        expect.objectContaining({ caption: "Edited second", sourceId: "two" }),
      ],
      socialAccountIds: [12],
    });
  });

  it("does not submit the worker job when media preparation fails", async () => {
    const item = createItem("one");
    vi.mocked(item.renderMedia).mockRejectedValue(new Error("Render failed."));

    await expect(
      queuePostBridgeBatchItems({
        captions: ["First"],
        items: [item],
        musicTrack: null,
        onCompletedCountChange: vi.fn(),
        onProgressChange: vi.fn(),
        platforms: ["instagram"],
        socialAccountIds: [12],
      }),
    ).rejects.toThrow("Render failed.");

    expect(submitPostBridgeBatch).not.toHaveBeenCalled();
    expect(deleteObjectsFromR2).toHaveBeenCalledWith([]);
  });
});
