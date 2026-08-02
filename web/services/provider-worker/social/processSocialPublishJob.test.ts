import { beforeEach, describe, expect, it, vi } from "vitest";
import { processSocialPublishJob } from "./processSocialPublishJob";

const mocks = vi.hoisted(() => ({
  markSocialProviderJobCompleted: vi.fn(),
}));

vi.mock("./markSocialProviderJobCompleted", () => ({
  markSocialProviderJobCompleted: mocks.markSocialProviderJobCompleted,
}));

describe("processSocialPublishJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
