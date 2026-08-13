import { describe, expect, it, vi } from "vitest";
import type { StudioReelWorkerClaimEnvelope } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerR2ObjectStore } from "../contracts/StudioReelWorkerR2ObjectStore";
import type { StudioReelWorkerRuntimeConfig } from "../contracts/StudioReelWorkerRuntimeConfig";
import { StudioReelWorkerCancellationError } from "../errors/StudioReelWorkerCancellationError";
import { createStudioReelClaimProcessorDependencies } from "./createStudioReelClaimProcessorDependencies";

const claim = {
  leaseAttempt: 2,
  leaseId: "lease_1",
  ownerId: "user_1",
  productId: "product_1",
  recipes: [],
  runAttempt: 1,
  runId: "run_1",
} as unknown as StudioReelWorkerClaimEnvelope;

const config = {
  commands: { ffmpegPath: "ffmpeg", ffprobePath: "ffprobe", fontPath: "font" },
  providers: { dansugcDownloadHosts: [] },
} as unknown as StudioReelWorkerRuntimeConfig;

describe("createStudioReelClaimProcessorDependencies", () => {
  it("revokes processing when owner Studio or Product scope changes", async () => {
    const post = vi.fn(async () => ({
      cancellationRequested: false,
      execution: { reason: null, state: "configured" },
      leaseValid: true,
      productOwned: false,
      runFound: true,
      status: "intentReady",
      studioAccess: true,
    }));
    const dependencies = createStudioReelClaimProcessorDependencies({
      claim,
      config,
      http: { post },
      objects: {} as StudioReelWorkerR2ObjectStore,
      runner: vi.fn(),
    });

    await expect(
      dependencies.assertActive("sources_acquired", 0),
    ).rejects.toMatchObject({
      code: "EXECUTION_ACCESS_REVOKED",
      kind: "permanent",
    });
  });

  it("observes cancellation before the next provider or render side effect", async () => {
    const post = vi.fn(async () => ({
      cancellationRequested: true,
      execution: { reason: null, state: "configured" },
      leaseValid: true,
      productOwned: true,
      runFound: true,
      status: "intentReady",
      studioAccess: true,
    }));
    const dependencies = createStudioReelClaimProcessorDependencies({
      claim,
      config,
      http: { post },
      objects: {} as StudioReelWorkerR2ObjectStore,
      runner: vi.fn(),
    });

    await expect(
      dependencies.assertActive("rendered", 1),
    ).rejects.toBeInstanceOf(StudioReelWorkerCancellationError);
  });
});
