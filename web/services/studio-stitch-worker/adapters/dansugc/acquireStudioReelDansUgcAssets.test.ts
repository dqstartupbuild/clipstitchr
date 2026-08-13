import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerCostReservation } from "../../contracts/StudioReelWorkerCostReservation";
import type { StudioReelWorkerR2ObjectStore } from "../../contracts/StudioReelWorkerR2ObjectStore";
import { acquireStudioReelDansUgcAssets } from "./acquireStudioReelDansUgcAssets";
import { StudioReelWorkerCancellationError } from "../../errors/StudioReelWorkerCancellationError";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

describe("acquireStudioReelDansUgcAssets", () => {
  it("cost-gates, probes, uploads, and checkpoints provider identity without URLs", async () => {
    const workspacePath = await mkdtemp(join(tmpdir(), "stitch-dansugc-test-"));
    directories.push(workspacePath);
    const source = { kind: "videoClip" as const, videoClipId: "placeholder_1" };
    const recipe = {
      id: "recipe_1",
      segments: [
        {
          playbackRate: 1,
          source,
          sourceOffsetSeconds: 0,
          timelineDurationSeconds: 5,
        },
      ],
    } as unknown as StudioStitchRecipeV1;
    const claim = {
      ownerId: "user_1",
      productId: "product_1",
      runAttempt: 1,
      runId: "run_1",
    } as unknown as StudioReelWorkerClaimEnvelope;
    const reserve = vi.fn<
      (invocationId: string) => Promise<StudioReelWorkerCostReservation>
    >(
      async () => ({
        alreadyReserved: false,
        disposition: "reserved" as const,
        reservationId: "reservation_1",
      }),
    );
    const assertActive = vi.fn(async () => undefined);
    const request = vi.fn<typeof fetch>(async (url, init) => {
      const target = new URL(String(url));
      if (target.pathname === "/api/v1/broll/purchase") {
        expect(init?.method).toBe("POST");
        return Response.json({
          purchases: [
            {
              currency: "USD",
              download_url:
                "https://media.example.test/full/video.mp4?signature=private",
              price_paid: 3,
              purchased_at: "2026-08-12T00:00:00.000Z",
              video_id: "video_1",
            },
          ],
        });
      }
      if (target.hostname === "media.example.test") {
        return new Response(new Uint8Array([1, 2, 3, 4]), {
          headers: {
            "content-length": "4",
            "content-type": "video/mp4",
          },
        });
      }
      throw new Error("Unexpected fake URL");
    });
    const objects = {
      putFileVerified: vi.fn(async ({ objectKey }) => ({
        objectKey,
        objectVersion: "version-12345678",
        sha256Base64: "base64",
        sha256Hex: "a".repeat(64),
        sizeBytes: 4,
      })),
    } as unknown as StudioReelWorkerR2ObjectStore;
    const runner = vi.fn(async () => ({
      stderr: "",
      stdout: JSON.stringify({
        format: { duration: "8", format_name: "mov,mp4", size: "4" },
        streams: [
          { codec_name: "h264", codec_type: "video", height: 1920, width: 1080 },
        ],
      }),
    }));

    const result = await acquireStudioReelDansUgcAssets({
      allowedDownloadHosts: ["media.example.test"],
      apiKey: "dsk_test_key",
      assertActive,
      claim,
      fetch: request,
      ffprobePath: "ffprobe",
      objects,
      recipe,
      reserve,
      runner,
      selections: [
        {
          modelId: "model_1",
          price: 3,
          recipeId: "recipe_1",
          source,
          title: "Reaction",
          videoId: "video_1",
        },
      ],
      workspacePath,
    });

    expect(reserve.mock.calls.map(([invocation]) => invocation)).toEqual([
      "recipe_1_dansugc_purchase_1",
      "recipe_1_dansugc_download_1_1",
    ]);
    expect(assertActive.mock.calls.length).toBeGreaterThanOrEqual(5);
    expect(objects.putFileVerified).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "video/mp4",
        ownerId: "user_1",
        sizeBytes: 4,
      }),
    );
    expect(result.checkpointAssets).toEqual([
      expect.objectContaining({
        modelId: "model_1",
        purchasedAt: "2026-08-12T00:00:00.000Z",
        sha256: "a".repeat(64),
        videoId: "video_1",
      }),
    ]);
    expect(JSON.stringify(result.checkpointAssets)).not.toContain("signature");
    expect(JSON.stringify(result.checkpointAssets)).not.toContain("https://");
  });

  it("rechecks cancellation after reservation and before paid purchase", async () => {
    const workspacePath = await mkdtemp(join(tmpdir(), "stitch-dansugc-cancel-"));
    directories.push(workspacePath);
    const source = { kind: "videoClip" as const, videoClipId: "placeholder_1" };
    const reserve = vi.fn<
      (invocationId: string) => Promise<StudioReelWorkerCostReservation>
    >(
      async () => ({
        alreadyReserved: false,
        disposition: "reserved" as const,
        reservationId: "reservation_1",
      }),
    );
    const request = vi.fn<typeof fetch>();
    const assertActive = vi
      .fn<() => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        new StudioReelWorkerCancellationError("claim_validated", 0),
      );
    await expect(
      acquireStudioReelDansUgcAssets({
        allowedDownloadHosts: ["media.example.test"],
        apiKey: "dsk_test_key",
        assertActive,
        claim: {
          ownerId: "user_1",
          productId: "product_1",
          runAttempt: 1,
          runId: "run_1",
        } as unknown as StudioReelWorkerClaimEnvelope,
        fetch: request,
        ffprobePath: "ffprobe",
        objects: {} as StudioReelWorkerR2ObjectStore,
        recipe: {
          id: "recipe_1",
          segments: [],
        } as unknown as StudioStitchRecipeV1,
        reserve,
        runner: vi.fn(),
        selections: [
          {
            modelId: "model_1",
            price: 3,
            recipeId: "recipe_1",
            source,
            title: "Reaction",
            videoId: "video_1",
          },
        ],
        workspacePath,
      }),
    ).rejects.toBeInstanceOf(StudioReelWorkerCancellationError);
    expect(reserve).toHaveBeenCalledOnce();
    expect(request).not.toHaveBeenCalled();
  });
});
