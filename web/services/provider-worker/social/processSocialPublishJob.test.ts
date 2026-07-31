import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialApiError } from "./SocialApiError";
import { processSocialPublishJob } from "./processSocialPublishJob";

const mocks = vi.hoisted(() => ({
  assertSocialPublishBillingForWorker: vi.fn(),
  getValidSocialAccessToken: vi.fn(),
  markSocialProviderJobCompleted: vi.fn(),
  processTikTokPublish: vi.fn(),
}));

vi.mock("./assertSocialPublishBillingForWorker", () => ({
  assertSocialPublishBillingForWorker:
    mocks.assertSocialPublishBillingForWorker,
}));
vi.mock("./getValidSocialAccessToken", () => ({
  getValidSocialAccessToken: mocks.getValidSocialAccessToken,
}));
vi.mock("./markSocialProviderJobCompleted", () => ({
  markSocialProviderJobCompleted: mocks.markSocialProviderJobCompleted,
}));
vi.mock("./tiktok/processTikTokPublish", () => ({
  processTikTokPublish: mocks.processTikTokPublish,
}));

describe("processSocialPublishJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertSocialPublishBillingForWorker.mockResolvedValue(undefined);
    mocks.getValidSocialAccessToken.mockResolvedValue("access_token");
  });

  it("does not restart delivery after another process made the target inactive", async () => {
    const query = vi.fn().mockResolvedValue({
      account: {
        accessTokenCiphertext: "ciphertext",
        externalAccountId: "external_1",
        id: "account_1",
        ownerId: "owner_1",
        platform: "tiktok",
        tokenEncryptionVersion: 1,
        username: "creator",
      },
      assets: [],
      attempts: [],
      post: {
        caption: "Caption",
        id: "post_1",
        ownerId: "owner_1",
        productId: "product_1",
        title: "Title",
      },
      publications: [],
      target: {
        controlsJson: "{}",
        id: "target_1",
        platform: "tiktok",
        postId: "post_1",
        publishMode: "direct",
        socialAccountId: "account_1",
        status: "failed",
      },
    });
    const mutation = vi.fn();
    const job = {
      id: "provider_job_1",
      inputSnapshotJson: JSON.stringify({
        postId: "post_1",
        targetId: "target_1",
      }),
      jobType: "social-publish",
      ownerId: "owner_1",
    };

    await processSocialPublishJob({
      client: { mutation, query } as never,
      job: job as never,
      providerWorkerSecret: "worker",
    });

    expect(mocks.markSocialProviderJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "target-failed" }),
    );
    expect(mutation).not.toHaveBeenCalled();
  });

  it("keeps an account connected when TikTok rejects an unaudited direct post", async () => {
    const query = vi.fn().mockResolvedValue({
      account: {
        accessTokenCiphertext: "ciphertext",
        externalAccountId: "external_1",
        id: "account_1",
        ownerId: "owner_1",
        platform: "tiktok",
        tokenEncryptionVersion: 1,
        username: "creator",
      },
      assets: [],
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
        controlsJson: "{}",
        id: "target_1",
        platform: "tiktok",
        postId: "post_1",
        publishMode: "direct",
        socialAccountId: "account_1",
        status: "publishing",
      },
    });
    const mutation = vi.fn().mockResolvedValue(undefined);
    const message =
      "TikTok requires a private account for automatic posts until ClipStitchr's TikTok review is approved.";
    mocks.processTikTokPublish.mockRejectedValue(
      new SocialApiError(
        message,
        403,
        JSON.stringify({
          error: {
            code: "unaudited_client_can_only_post_to_private_accounts",
          },
        }),
        undefined,
        "unaudited_client_can_only_post_to_private_accounts",
      ),
    );

    await processSocialPublishJob({
      client: { mutation, query } as never,
      job: {
        id: "provider_job_1",
        inputSnapshotJson: JSON.stringify({
          postId: "post_1",
          targetId: "target_1",
        }),
        jobType: "social-publish",
        ownerId: "owner_1",
      } as never,
      providerWorkerSecret: "worker",
    });

    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        errorCode: "unaudited_client_can_only_post_to_private_accounts",
        errorMessage: message,
        needsAttention: false,
        providerResponseJson: expect.stringContaining(
          "unaudited_client_can_only_post_to_private_accounts",
        ),
        targetId: "target_1",
      }),
    );
    expect(mutation).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: "account_1",
        errorMessage: message,
      }),
    );
    expect(mocks.markSocialProviderJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "delivery-failed" }),
    );
  });
});
