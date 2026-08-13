import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { StudioClipsWorkerError } from "./errors/StudioClipsWorkerError";
import { processStudioClipsClaim } from "./processStudioClipsClaim";
import { createStudioClipsTestClaim } from "./testing/createStudioClipsTestClaim";
import { createStudioClipsTestDependencies } from "./testing/createStudioClipsTestDependencies";

describe("processStudioClipsClaim", () => {
  it("enforces access, gates every paid stage, persists checkpoints, and stores owned outputs", async () => {
    const { dependencies, progressEvents, savedCheckpoints, workspacePaths } =
      createStudioClipsTestDependencies();
    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim(),
      dependencies,
    );

    expect(result.status).toBe("completed");
    expect(dependencies.access.assertStudioAccess).toHaveBeenCalledWith({
      ownerId: "user_123",
      taskId: "task_123",
    });
    expect(dependencies.access.assertProductOwnership).toHaveBeenCalledWith({
      ownerId: "user_123",
      productId: "product_123",
      taskId: "task_123",
    });
    expect(dependencies.access.assertClaimLease).toHaveBeenCalledWith({
      attempt: 1,
      leaseId: "lease_123",
      ownerId: "user_123",
      productId: "product_123",
      taskId: "task_123",
    });
    expect(
      vi
        .mocked(dependencies.costGate.assertOwnerAndGlobalAllowed)
        .mock.calls.map(([input]) => input.stage),
    ).toEqual(["download", "transcription", "llm", "render"]);
    expect(savedCheckpoints).toEqual([
      "source_acquired",
      "media_validated",
      "transcribed",
      "analyzed",
      "b_roll_ready",
      "rendered",
      "output_stored",
    ]);
    expect(progressEvents.at(-1)).toMatchObject({
      checkpoint: "completed",
      status: "completed",
    });
    expect(result).toMatchObject({
      outputs: [
        {
          objectKey:
            "users/user_123/studio/v1/studio-clips/product_123/task_123/clip_1/clip-1.mp4",
        },
      ],
    });
    await expect(access(workspacePaths[0])).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("stops at a durable checkpoint when cancellation is requested", async () => {
    const { dependencies, savedCheckpoints } =
      createStudioClipsTestDependencies();
    let checks = 0;
    vi.mocked(
      dependencies.cancellation.getIsCancellationRequested,
    ).mockImplementation(async () => {
      checks += 1;
      return checks >= 4;
    });

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim(),
      dependencies,
    );

    expect(result).toMatchObject({
      checkpoint: "source_acquired",
      resume: { checkpoint: "source_acquired", revision: 1 },
      status: "cancelled",
    });
    expect(savedCheckpoints).toEqual(["source_acquired"]);
    expect(dependencies.pipeline.probeMedia).not.toHaveBeenCalled();
    expect(
      vi
        .mocked(dependencies.costGate.assertOwnerAndGlobalAllowed)
        .mock.calls.map(([input]) => input.stage),
    ).toEqual(["download"]);
  });

  it("does not create work or publish progress when Studio access is denied", async () => {
    const { dependencies, progressEvents, workspacePaths } =
      createStudioClipsTestDependencies();
    vi.mocked(dependencies.access.assertStudioAccess).mockRejectedValue(
      new StudioClipsWorkerError({
        code: "STUDIO_ACCESS_DENIED",
        kind: "permanent",
        publicMessage: "Studio access was denied.",
      }),
    );

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim(),
      dependencies,
    );

    expect(result).toMatchObject({
      failure: { code: "STUDIO_ACCESS_DENIED", kind: "permanent" },
      status: "error",
    });
    expect(dependencies.access.assertProductOwnership).not.toHaveBeenCalled();
    expect(dependencies.pipeline.preflightSource).not.toHaveBeenCalled();
    expect(progressEvents).toEqual([]);
    expect(workspacePaths).toEqual([]);
  });

  it("stops before lease or work when Product ownership is denied", async () => {
    const { dependencies, progressEvents } =
      createStudioClipsTestDependencies();
    vi.mocked(dependencies.access.assertProductOwnership).mockRejectedValue(
      new StudioClipsWorkerError({
        code: "PRODUCT_OWNERSHIP_DENIED",
        kind: "permanent",
        publicMessage: "Product ownership was denied.",
      }),
    );

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim(),
      dependencies,
    );

    expect(result).toMatchObject({
      failure: { code: "PRODUCT_OWNERSHIP_DENIED", kind: "permanent" },
      status: "error",
    });
    expect(dependencies.access.assertStudioAccess).toHaveBeenCalledOnce();
    expect(dependencies.access.assertClaimLease).not.toHaveBeenCalled();
    expect(dependencies.pipeline.preflightSource).not.toHaveBeenCalled();
    expect(progressEvents).toEqual([]);
  });

  it("returns a retryable partial failure without exposing provider details", async () => {
    const { dependencies } = createStudioClipsTestDependencies();
    const providerError = Object.assign(
      new Error(
        "Bearer super-secret https://r2.test/source?X-Amz-Signature=hidden",
      ),
      { code: "ECONNRESET" },
    );
    vi.mocked(dependencies.pipeline.transcribe).mockRejectedValue(providerError);

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim(),
      dependencies,
    );
    const serialized = JSON.stringify(result);

    expect(result).toMatchObject({
      checkpoint: "media_validated",
      failure: { kind: "retryable" },
      resume: { checkpoint: "media_validated", revision: 2 },
      status: "error",
    });
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("X-Amz-Signature");
    expect(dependencies.pipeline.analyze).not.toHaveBeenCalled();
  });

  it("blocks a denied spend gate before the provider operation", async () => {
    const { dependencies } = createStudioClipsTestDependencies();
    vi.mocked(
      dependencies.costGate.assertOwnerAndGlobalAllowed,
    ).mockImplementation(
      async ({ stage }) => {
        if (stage === "transcription") {
          throw new StudioClipsWorkerError({
            code: "TRANSCRIPTION_RATE_LIMITED",
            kind: "retryable",
            publicMessage: "Transcription capacity is temporarily full.",
          });
        }
      },
    );

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim(),
      dependencies,
    );

    expect(result).toMatchObject({
      checkpoint: "media_validated",
      failure: { code: "TRANSCRIPTION_RATE_LIMITED", kind: "retryable" },
      status: "error",
    });
    expect(dependencies.pipeline.transcribe).not.toHaveBeenCalled();
  });

  it("resumes after analysis without repeating earlier paid stages", async () => {
    const { dependencies, savedCheckpoints } =
      createStudioClipsTestDependencies();
    vi.mocked(dependencies.checkpoints.restore).mockImplementation(
      async ({ workspace }) => {
        const localPath = join(workspace.path, "restored-source.mp4");
        await writeFile(localPath, Buffer.alloc(32));
        return {
          analysis: {
            payload: { segments: [{ endSeconds: 30, startSeconds: 10 }] },
            snapshotVersion: 1,
          },
          media: {
            audioCodec: "aac",
            container: "mp4",
            contentType: "video/mp4",
            durationSeconds: 120,
            hasAudio: true,
            hasVideo: true,
            height: 1080,
            sizeBytes: 32,
            videoCodec: "h264",
            width: 1920,
          },
          source: { contentType: "video/mp4", localPath, sizeBytes: 32 },
          transcript: { languageCode: "en", text: "Restored transcript." },
        };
      },
    );

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim({
        options: { includeBroll: true },
        resume: { checkpoint: "analyzed", revision: 4 },
      }),
      dependencies,
    );

    expect(result.status).toBe("completed");
    expect(dependencies.pipeline.acquireSource).not.toHaveBeenCalled();
    expect(dependencies.pipeline.transcribe).not.toHaveBeenCalled();
    expect(dependencies.pipeline.analyze).not.toHaveBeenCalled();
    expect(
      vi
        .mocked(dependencies.costGate.assertOwnerAndGlobalAllowed)
        .mock.calls.map(([input]) => input.stage),
    ).toEqual(["b_roll", "render"]);
    expect(savedCheckpoints).toEqual([
      "b_roll_ready",
      "rendered",
      "output_stored",
    ]);
  });

  it("finishes an output-stored resume without rehydrating temporary media", async () => {
    const { dependencies } = createStudioClipsTestDependencies();
    vi.mocked(dependencies.checkpoints.restore).mockResolvedValue({
      outputs: [
        {
          artifactId: "clip_1",
          contentType: "video/mp4",
          objectKey:
            "users/user_123/studio/v1/studio-clips/product_123/task_123/clip_1/clip-1.mp4",
          sha256: "a".repeat(64),
          sizeBytes: 24,
        },
      ],
    });

    const result = await processStudioClipsClaim(
      createStudioClipsTestClaim({
        resume: { checkpoint: "output_stored", revision: 7 },
      }),
      dependencies,
    );

    expect(result.status).toBe("completed");
    expect(dependencies.pipeline.preflightSource).not.toHaveBeenCalled();
    expect(
      dependencies.costGate.assertOwnerAndGlobalAllowed,
    ).not.toHaveBeenCalled();
    expect(dependencies.output.store).not.toHaveBeenCalled();
  });
});
