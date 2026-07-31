import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialOutcomeUnknownError } from "../SocialOutcomeUnknownError";
import { processInstagramPublish } from "./processInstagramPublish";

const mocks = vi.hoisted(() => ({
  createInstagramMediaContainer: vi.fn(),
  fetchInstagramPermalink: vi.fn(),
  publishInstagramContainer: vi.fn(),
  waitForInstagramContainer: vi.fn(),
}));

vi.mock("./createInstagramMediaContainer", () => ({
  createInstagramMediaContainer: mocks.createInstagramMediaContainer,
}));
vi.mock("./fetchInstagramPermalink", () => ({
  fetchInstagramPermalink: mocks.fetchInstagramPermalink,
}));
vi.mock("./publishInstagramContainer", () => ({
  publishInstagramContainer: mocks.publishInstagramContainer,
}));
vi.mock("./waitForInstagramContainer", () => ({
  waitForInstagramContainer: mocks.waitForInstagramContainer,
}));

describe("processInstagramPublish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createInstagramMediaContainer.mockResolvedValue({ id: "container_1" });
    mocks.waitForInstagramContainer.mockResolvedValue({
      id: "container_1",
      status_code: "FINISHED",
    });
    mocks.publishInstagramContainer.mockResolvedValue({ id: "media_1" });
    mocks.fetchInstagramPermalink.mockResolvedValue(
      "https://instagram.example.com/p/media_1",
    );
  });

  it("creates, waits, rechecks billing, then publishes", async () => {
    const query = vi.fn().mockResolvedValue({});
    const mutation = vi.fn().mockResolvedValue({});
    const result = await processInstagramPublish({
      accessToken: "token",
      attemptId: "attempt_1",
      client: { query, mutation } as never,
      document: {
        account: {
          accessTokenCiphertext: "cipher",
          externalAccountId: "ig_account",
          id: "account_1",
          ownerId: "owner_1",
          platform: "instagram",
          tokenEncryptionVersion: 1,
          username: "creator",
        },
        assets: [
          {
            contentType: "video/mp4",
            id: "asset_1",
            kind: "video",
            objectKey: "owner/video.mp4",
            order: 0,
            sizeBytes: 100,
          },
        ],
        attempts: [
          {
            id: "attempt_1",
            status: "running",
          },
        ],
        post: {
          caption: "Caption",
          id: "post_1",
          ownerId: "owner_1",
          productId: "product_1",
          title: "Title",
        },
        publications: [],
        target: {
          controlsJson: JSON.stringify({ shareToFeed: true }),
          id: "target_1",
          platform: "instagram",
          postId: "post_1",
          publishMode: "direct",
          socialAccountId: "account_1",
          status: "publishing",
        },
      },
      mediaUrls: ["https://media.example.com/video"],
      providerWorkerSecret: "worker",
    });

    expect(mocks.createInstagramMediaContainer).toHaveBeenCalledWith(
      expect.objectContaining({ isVideo: true, shareToFeed: true }),
    );
    expect(mocks.waitForInstagramContainer).toHaveBeenCalledWith(
      "container_1",
      "token",
    );
    expect(query).toHaveBeenCalledTimes(2);
    expect(mocks.publishInstagramContainer).toHaveBeenCalledWith(
      "ig_account",
      "container_1",
      "token",
    );
    expect(result).toMatchObject({
      state: "published",
      publicationIds: ["media_1"],
    });
  });

  it("does not repeat an ambiguous final media publish call", async () => {
    await expect(
      processInstagramPublish({
        accessToken: "token",
        attemptId: "attempt_1",
        client: { query: vi.fn(), mutation: vi.fn() } as never,
        document: {
          account: {
            accessTokenCiphertext: "cipher",
            externalAccountId: "ig_account",
            id: "account_1",
            ownerId: "owner_1",
            platform: "instagram",
            tokenEncryptionVersion: 1,
            username: "creator",
          },
          assets: [
            {
              contentType: "video/mp4",
              id: "asset_1",
              kind: "video",
              objectKey: "owner/video.mp4",
              order: 0,
              sizeBytes: 100,
            },
          ],
          attempts: [
            {
              id: "attempt_1",
              providerContainerId: "container_1",
              retrySafety: "do_not_retry_reconcile_only",
              stage: "final_publish_requested",
              status: "running",
            },
          ],
          post: {
            caption: "Caption",
            id: "post_1",
            ownerId: "owner_1",
            productId: "product_1",
            title: "Title",
          },
          publications: [],
          target: {
            controlsJson: JSON.stringify({ shareToFeed: true }),
            id: "target_1",
            platform: "instagram",
            postId: "post_1",
            publishMode: "direct",
            socialAccountId: "account_1",
            status: "publishing",
          },
        },
        mediaUrls: ["https://media.example.com/video"],
        providerWorkerSecret: "worker",
      }),
    ).rejects.toBeInstanceOf(SocialOutcomeUnknownError);
    expect(mocks.publishInstagramContainer).not.toHaveBeenCalled();
  });
});
