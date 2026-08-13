import { describe, expect, it, vi } from "vitest";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import { reserveStudioReelCost } from "./reserveStudioReelCost";

const claim = {
  leaseAttempt: 2,
  leaseId: "lease_1",
  ownerId: "user_1",
  productId: "product_1",
  runAttempt: 3,
  runId: "run_1",
} as StudioReelWorkerClaimEnvelope;

describe("reserveStudioReelCost", () => {
  it("sends the complete Product and lease provenance before provider work", async () => {
    const post = vi.fn(async () => ({
      alreadyReserved: false,
      disposition: "reserved",
      reservationId: "reservation_1",
    }));

    await expect(
      reserveStudioReelCost({
        claim,
        http: { post },
        invocationId: "recipe_1_gemini_3",
        provider: "gemini",
        recipeId: "recipe_1",
      }),
    ).resolves.toMatchObject({ reservationId: "reservation_1" });
    expect(post).toHaveBeenCalledWith(
      "/api/studio/stitch/worker/cost-reservations",
      expect.objectContaining({
        invocationId: "recipe_1_gemini_3",
        leaseAttempt: 2,
        leaseId: "lease_1",
        operation: "analyze_demo",
        ownerId: "user_1",
        productId: "product_1",
        runAttempt: 3,
        runId: "run_1",
      }),
    );
  });

  it("stops instead of replaying an uncertain paid provider operation", async () => {
    const post = vi.fn(async () => ({
      alreadyReserved: true,
      disposition: "uncertain",
      reservationId: "reservation_1",
    }));

    await expect(
      reserveStudioReelCost({
        claim,
        http: { post },
        invocationId: "recipe_1_elevenlabs_3",
        provider: "elevenlabs",
        recipeId: "recipe_1",
      }),
    ).rejects.toMatchObject({
      code: "PROVIDER_OUTCOME_UNCERTAIN",
      kind: "uncertain",
    });
    expect(post).toHaveBeenCalledOnce();
  });
});
