import { beforeEach, describe, expect, it, vi } from "vitest";
import { processPostBridgeBatch } from "./processPostBridgeBatch";
import { createPostBridgePost } from "@/lib/clipstitchr/server/postBridge/createPostBridgePost";
import { uploadPostBridgeMediaFromR2Object } from "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object";

vi.mock("@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey", () => ({
  decryptPostBridgeApiKey: () => "decrypted-key",
}));
vi.mock("@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts", () => ({
  listPostBridgeSocialAccounts: async () => [
    { id: 12, platform: "instagram", username: "creator" },
  ],
}));
vi.mock("@/lib/clipstitchr/server/postBridge/createPostBridgePost", () => ({
  createPostBridgePost: vi.fn(),
}));
vi.mock(
  "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object",
  () => ({
    uploadPostBridgeMediaFromR2Object: vi.fn(),
  }),
);
vi.mock("@/lib/clipstitchr/server/r2/deleteR2Objects", () => ({
  deleteR2Objects: vi.fn(async () => undefined),
}));

function createItem(sourceId: string) {
  return {
    caption: `Caption ${sourceId}`,
    hasAudio: false,
    mediaFiles: [
      {
        media: {
          mediaKind: "image" as const,
          mimeType: "image/png",
          name: `${sourceId}.png`,
          sizeBytes: 10,
        },
        sourceObject: {
          contentType: "image/png",
          key: `users/user_1/post-bridge-media/${sourceId}`,
          size: 10,
        },
      },
    ],
    sourceId,
    sourceType: "swipe" as const,
    title: `Swipe ${sourceId}`,
  };
}

describe("processPostBridgeBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(uploadPostBridgeMediaFromR2Object).mockImplementation(
      async ({ sourceObject }) => ({
        mediaId: `media-${sourceObject.key.split("/").at(-1)}`,
        mediaKind: "image",
        mimeType: "image/png",
        name: "post.png",
        sizeBytes: 10,
      }),
    );
    vi.mocked(createPostBridgePost).mockImplementation(async ({ mediaIds }) => ({
      caption: "Scheduled caption",
      created_at: "2026-07-19T00:00:00.000Z",
      id: `post-${mediaIds[0]}`,
      is_draft: false,
      scheduled_at: "2026-07-20T00:00:00.000Z",
      social_accounts: [12],
      status: "scheduled",
      updated_at: "2026-07-19T00:00:00.000Z",
    }));
  });

  it("continues the stored randomized order and skips completed items on retry", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ encryptedApiKey: "v1:encrypted" })
      .mockResolvedValue({ id: "saved-source" });
    const mutation = vi.fn().mockResolvedValue(undefined);
    const items = [createItem("three"), createItem("one"), createItem("two")];

    await processPostBridgeBatch({
      client: { mutation, query } as never,
      job: {
        id: "provider:post-bridge-batch:1",
        inputSnapshotJson: JSON.stringify({
          items,
          socialAccountIds: [12],
        }),
        outputAssetIds: ["three"],
        ownerId: "user_1",
      },
      providerWorkerSecret: "worker-secret",
    });

    expect(uploadPostBridgeMediaFromR2Object).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(uploadPostBridgeMediaFromR2Object).mock.calls.map(
        ([options]) => options.sourceObject.key,
      ),
    ).toEqual([
      "users/user_1/post-bridge-media/one",
      "users/user_1/post-bridge-media/two",
    ]);
    expect(createPostBridgePost).toHaveBeenCalledTimes(2);
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        outputAssetId: "one",
        status: "running",
      }),
    );
    expect(mutation).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        progress: 1,
        stage: "completed",
        status: "completed",
      }),
    );
  });
});
