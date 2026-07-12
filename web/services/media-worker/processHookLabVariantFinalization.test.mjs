import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { processHookLabVariantFinalization } from "./processHookLabVariantFinalization.mjs";

const scratchRoots = [];

afterEach(async () => {
  await Promise.all(
    scratchRoots.splice(0).map((path) => rm(path, { force: true, recursive: true })),
  );
});

describe("processHookLabVariantFinalization", () => {
  it("saves the reusable opening and Stitch lineage before cleaning temporary inputs", async () => {
    const scratchDir = await mkdtemp(join(tmpdir(), "hook-lab-finalizer-"));
    scratchRoots.push(scratchDir);
    const client = { mutation: vi.fn().mockResolvedValue(null) };
    const deleteR2Object = vi.fn().mockResolvedValue(undefined);
    const uploadR2Object = vi.fn(async ({ body, contentType, key }) => ({
      contentType,
      key,
      size: body.byteLength,
    }));
    const job = {
      id: "media:variant-1",
      jobType: "hook-lab-variant-finalization",
      ownerId: "owner-1",
      inputSnapshotJson: JSON.stringify({
        clipId: "clip-1",
        clipName: "Opening 1",
        demoClipId: "demo-1",
        demoClipName: "Demo 1",
        demoDuration: 5,
        demoTrimRange: { start: 0, end: 5 },
        generatedCaption: "A useful caption",
        hookLabIdeaId: "idea-1",
        hookLabIdeaUseId: "use-1",
        hookLabIdeaVariantId: "variant-1",
        hookLabIdeaVariantIndex: 2,
        includeDemoAudio: true,
        includeUgcAudio: false,
        productId: "product-1",
        providerJobId: "provider-1",
        sourceVideoObject: {
          contentType: "video/mp4",
          key: "users/owner-1/hook-lab/tmp/opening.mp4",
          size: 200,
        },
        stitchId: "stitch-1",
        stitchName: "Finished Stitch 1",
        temporaryObjects: [
          {
            contentType: "image/png",
            key: "users/owner-1/hook-lab/tmp/still.png",
            size: 100,
          },
          {
            contentType: "video/mp4",
            key: "users/owner-1/hook-lab/tmp/opening.mp4",
            size: 200,
          },
        ],
        textOverlay: {
          endTime: 8,
          fontSize: 0.05,
          startTime: 0,
          styleId: "hook",
          text: "Fresh hook",
          width: 0.8,
          x: 0.1,
          y: 0.15,
        },
        ugcDuration: 8,
        ugcTrimRange: { start: 0, end: 8 },
      }),
    };

    await processHookLabVariantFinalization({
      client,
      config: { mediaWorkerSecret: "secret", scratchDir },
      createPoster: async ({ outputPath }) => {
        await writeFile(outputPath, "poster");
      },
      createVideoClipObjectKey: ({ clipId, kind, ownerId }) =>
        `users/${ownerId}/clips/${clipId}/${kind}`,
      deleteR2Object,
      downloadR2Object: async ({ outputPath }) => {
        await writeFile(outputPath, "source");
      },
      job,
      normalizeVideo: async ({ outputPath }) => {
        await writeFile(outputPath, "normalized-video");
      },
      r2: { client: true },
      readVideoMetadata: async () => ({
        aspectRatio: 9 / 16,
        duration: 8,
        hasAudio: false,
        height: 1920,
        width: 1080,
      }),
      uploadR2Object,
    });

    const mutationInputs = client.mutation.mock.calls.map(([, input]) => input);

    expect(mutationInputs).toContainEqual(
      expect.objectContaining({
        hookLabIdeaId: "idea-1",
        hookLabIdeaUseId: "use-1",
        hookLabIdeaVariantId: "variant-1",
        hookLabIdeaVariantIndex: 2,
        id: "clip-1",
        videoObject: expect.objectContaining({
          key: "users/owner-1/clips/clip-1/video",
        }),
        posterObject: expect.objectContaining({
          key: "users/owner-1/clips/clip-1/poster",
        }),
      }),
    );
    expect(mutationInputs).toContainEqual(
      expect.objectContaining({
        hookLabIdeaId: "idea-1",
        hookLabIdeaUseId: "use-1",
        hookLabIdeaVariantId: "variant-1",
        hookLabIdeaVariantIndex: 2,
        id: "stitch-1",
        ugcClipId: "clip-1",
      }),
    );
    expect(mutationInputs).toContainEqual(
      expect.objectContaining({
        finishedStitchId: "stitch-1",
        generatedUgcClipId: "clip-1",
        id: "variant-1",
      }),
    );
    expect(deleteR2Object).toHaveBeenCalledTimes(2);
    expect(deleteR2Object).toHaveBeenCalledWith(
      expect.objectContaining({ key: "users/owner-1/hook-lab/tmp/still.png" }),
    );
    expect(deleteR2Object).toHaveBeenCalledWith(
      expect.objectContaining({ key: "users/owner-1/hook-lab/tmp/opening.mp4" }),
    );
    await expect(
      access(join(scratchDir, encodeURIComponent(job.id))),
    ).rejects.toThrow();
  });

  it("removes uploaded output objects when clip persistence fails", async () => {
    const scratchDir = await mkdtemp(join(tmpdir(), "hook-lab-finalizer-"));
    scratchRoots.push(scratchDir);
    const client = {
      mutation: vi.fn(async (_reference, input) => {
        if (input?.id === "clip-1" && input.videoObject) {
          throw new Error("Clip save failed");
        }

        return null;
      }),
      query: vi.fn().mockResolvedValue(null),
    };
    const deleteR2Object = vi.fn().mockResolvedValue(undefined);
    const job = {
      id: "media:variant-1",
      jobType: "hook-lab-variant-finalization",
      ownerId: "owner-1",
      inputSnapshotJson: JSON.stringify({
        clipId: "clip-1",
        clipName: "Opening 1",
        demoClipId: "demo-1",
        demoClipName: "Demo 1",
        demoDuration: 5,
        hookLabIdeaId: "idea-1",
        hookLabIdeaUseId: "use-1",
        hookLabIdeaVariantId: "variant-1",
        hookLabIdeaVariantIndex: 0,
        productId: "product-1",
        providerJobId: "provider-1",
        sourceVideoObject: {
          contentType: "video/mp4",
          key: "users/owner-1/hook-lab/tmp/opening.mp4",
          size: 200,
        },
        stitchId: "stitch-1",
        stitchName: "Finished Stitch 1",
        ugcDuration: 8,
      }),
    };

    await expect(
      processHookLabVariantFinalization({
        client,
        config: { mediaWorkerSecret: "secret", scratchDir },
        createPoster: async ({ outputPath }) => {
          await writeFile(outputPath, "poster");
        },
        createVideoClipObjectKey: ({ clipId, kind, ownerId }) =>
          `users/${ownerId}/clips/${clipId}/${kind}`,
        deleteR2Object,
        downloadR2Object: async ({ outputPath }) => {
          await writeFile(outputPath, "source");
        },
        job,
        normalizeVideo: async ({ outputPath }) => {
          await writeFile(outputPath, "normalized-video");
        },
        r2: { client: true },
        readVideoMetadata: async () => ({
          aspectRatio: 9 / 16,
          duration: 8,
          hasAudio: false,
          height: 1920,
          width: 1080,
        }),
        uploadR2Object: async ({ body, contentType, key }) => ({
          contentType,
          key,
          size: body.byteLength,
        }),
      }),
    ).rejects.toThrow("Clip save failed");
    expect(client.query).toHaveBeenCalledOnce();
    expect(deleteR2Object).toHaveBeenCalledWith(
      expect.objectContaining({ key: "users/owner-1/clips/clip-1/video" }),
    );
    expect(deleteR2Object).toHaveBeenCalledWith(
      expect.objectContaining({ key: "users/owner-1/clips/clip-1/poster" }),
    );
  });
});
