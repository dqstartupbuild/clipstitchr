import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueSocialPublishingBatchItems } from "@/lib/clipstitchr/client/queueSocialPublishingBatchItems";
import { scheduleSocialPublishingPost } from "@/lib/clipstitchr/client/scheduleSocialPublishingPost";
import type { SocialPublishingBatchQueueItem } from "@/lib/clipstitchr/types/SocialPublishingBatchQueueItem";

vi.mock("@/lib/clipstitchr/client/scheduleSocialPublishingPost", () => ({
  scheduleSocialPublishingPost: vi.fn(),
}));

function createItem(id: string): SocialPublishingBatchQueueItem {
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

describe("queueSocialPublishingBatchItems", () => {
  beforeEach(() => {
    vi.mocked(scheduleSocialPublishingPost).mockReset();
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
    vi.mocked(scheduleSocialPublishingPost).mockImplementation(async (options) => {
      callOrder.push(`queue-${options.sourceId}`);
      return {} as Awaited<ReturnType<typeof scheduleSocialPublishingPost>>;
    });

    await queueSocialPublishingBatchItems({
      captions: ["Edited first", "Edited second"],
      items: [firstItem, secondItem],
      musicTrack: null,
      onCompletedCountChange: vi.fn(),
      onProgressChange: vi.fn(),
      platforms: ["instagram"],
      socialAccountIds: ["account_12"],
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
    });

    expect(callOrder).toEqual(["render-one", "queue-one", "render-two", "queue-two"]);
    expect(scheduleSocialPublishingPost).toHaveBeenNthCalledWith(1, expect.objectContaining({ caption: "Edited first", sourceId: "one", useQueue: true }));
    expect(scheduleSocialPublishingPost).toHaveBeenNthCalledWith(2, expect.objectContaining({ caption: "Edited second", sourceId: "two", useQueue: true }));
  });

  it("resumes at the first unfinished item", async () => {
    const firstItem = createItem("one");
    const secondItem = createItem("two");
    const thirdItem = createItem("three");

    await queueSocialPublishingBatchItems({
      captions: ["First", "Second", "Third"],
      items: [firstItem, secondItem, thirdItem],
      musicTrack: null,
      onCompletedCountChange: vi.fn(),
      onProgressChange: vi.fn(),
      platforms: ["instagram"],
      socialAccountIds: ["account_12"],
      startIndex: 1,
      tiktokCommercialContentType: "none",
      tiktokConsentGiven: false,
      tiktokPrivacyLevel: "",
    });

    expect(firstItem.renderMedia).not.toHaveBeenCalled();
    expect(secondItem.renderMedia).toHaveBeenCalledOnce();
    expect(thirdItem.renderMedia).toHaveBeenCalledOnce();
    expect(scheduleSocialPublishingPost).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ sourceId: "two" }),
    );
    expect(scheduleSocialPublishingPost).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ sourceId: "three" }),
    );
  });
});
