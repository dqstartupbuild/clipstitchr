import { describe, expect, it, vi } from "vitest";
import { SocialNeedsAttentionError } from "./SocialNeedsAttentionError";
import { assertSocialPublishBillingForWorker } from "./assertSocialPublishBillingForWorker";

describe("assertSocialPublishBillingForWorker", () => {
  it("turns an execution-time billing change into a reviewable stop", async () => {
    const query = vi.fn().mockRejectedValue(new Error("inactive"));

    await expect(
      assertSocialPublishBillingForWorker({
        client: { query } as never,
        ownerId: "owner_1",
        providerWorkerSecret: "worker",
      }),
    ).rejects.toBeInstanceOf(SocialNeedsAttentionError);
  });
});
