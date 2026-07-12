import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { anyApi } from "convex/server";
import { getHookLabMediaJobTemporaryObjects } from "./getHookLabMediaJobTemporaryObjects.mjs";
import { getQuickEditPlaybackDuration } from "./getQuickEditPlaybackDuration.mjs";
import { parseHookLabVariantFinalizationInput } from "./parseHookLabVariantFinalizationInput.mjs";

const api = anyApi;
const TIKTOK_OUTPUT_HEIGHT = 1920;
const TIKTOK_OUTPUT_WIDTH = 1080;

export async function processHookLabVariantFinalization({
  client,
  config,
  createPoster,
  createVideoClipObjectKey,
  deleteR2Object,
  downloadR2Object,
  job,
  normalizeVideo,
  r2,
  readVideoMetadata,
  uploadR2Object,
}) {
  const input = parseHookLabVariantFinalizationInput(job.inputSnapshotJson);
  const scratchDir = join(config.scratchDir, encodeURIComponent(job.id));
  const sourcePath = join(scratchDir, "source.mp4");
  const outputPath = join(scratchDir, "normalized.mp4");
  const posterPath = join(scratchDir, "poster.jpg");
  const videoKey = createVideoClipObjectKey({
    clipId: input.clipId,
    kind: "video",
    ownerId: job.ownerId,
  });
  const posterKey = createVideoClipObjectKey({
    clipId: input.clipId,
    kind: "poster",
    ownerId: job.ownerId,
  });
  let clipSaved = false;

  await mkdir(scratchDir, { recursive: true });

  try {
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "normalizing-opening",
      updatedAt: new Date().toISOString(),
    });
    await downloadR2Object({
      client: r2,
      config,
      key: input.sourceVideoObject.key,
      outputPath: sourcePath,
    });
    await normalizeVideo({
      config,
      inputPath: sourcePath,
      outputPath,
      stripAudio: !input.includeUgcAudio,
    });
    await createPoster({ config, inputPath: outputPath, outputPath: posterPath });

    const [videoBody, posterBody, metadata] = await Promise.all([
      readFile(outputPath),
      readFile(posterPath),
      readVideoMetadata({ config, inputPath: outputPath }),
    ]);
    const [videoObject, posterObject] = await Promise.all([
      uploadR2Object({
        body: videoBody,
        client: r2,
        config,
        contentType: "video/mp4",
        key: videoKey,
      }),
      uploadR2Object({
        body: posterBody,
        client: r2,
        config,
        contentType: "image/jpeg",
        key: posterKey,
      }),
    ]);
    const updatedAt = new Date().toISOString();

    await client.mutation(
      api["videoClips/saveHookLabVariantFromMediaWorker"]
        .saveHookLabVariantFromMediaWorker,
      {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.clipId,
        name: input.clipName,
        productId: input.productId,
        hookLabIdeaId: input.hookLabIdeaId,
        hookLabIdeaUseId: input.hookLabIdeaUseId,
        hookLabIdeaVariantId: input.hookLabIdeaVariantId,
        hookLabIdeaVariantIndex: input.hookLabIdeaVariantIndex,
        videoObject,
        posterObject,
        sourceMimeType: input.sourceVideoObject.contentType,
        size: videoObject.size,
        originalSize: input.sourceVideoObject.size,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio,
        duration: metadata.duration,
        defaultTrimRange: { start: 0, end: metadata.duration },
        hasAudio: metadata.hasAudio,
        createdAt: updatedAt,
        updatedAt,
      },
    );
    clipSaved = true;

    const duration =
      getQuickEditPlaybackDuration({
        duration: metadata.duration,
        playbackRate: input.ugcPlaybackRate,
        removeRanges: input.ugcQuickEdit?.removeRanges,
        trimRange: input.ugcTrimRange,
      }) +
      getQuickEditPlaybackDuration({
        duration: input.demoDuration,
        playbackRate: input.demoPlaybackRate,
        removeRanges: input.demoQuickEdit?.removeRanges,
        trimRange: input.demoTrimRange,
      });

    await client.mutation(
      api["stitches/saveHookLabVariantFromMediaWorker"]
        .saveHookLabVariantFromMediaWorker,
      {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.stitchId,
        name: input.stitchName,
        mode: input.mode,
        ugcClipId: input.clipId,
        demoClipId: input.demoClipId,
        ugcClipName: input.clipName,
        demoClipName: input.demoClipName,
        ugcTrimRange: input.ugcTrimRange,
        demoTrimRange: input.demoTrimRange,
        ugcQuickEdit: input.ugcQuickEdit,
        demoQuickEdit: input.demoQuickEdit,
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        duration,
        includeDemoAudio: input.includeDemoAudio,
        includeUgcAudio: input.includeUgcAudio,
        demoPlaybackRate: input.demoPlaybackRate,
        ugcPlaybackRate: input.ugcPlaybackRate,
        music: input.music,
        textOverlay: input.textOverlay,
        socialCaption: input.generatedCaption,
        hookLabIdeaId: input.hookLabIdeaId,
        hookLabIdeaUseId: input.hookLabIdeaUseId,
        hookLabIdeaVariantId: input.hookLabIdeaVariantId,
        hookLabIdeaVariantIndex: input.hookLabIdeaVariantIndex,
        createdAt: updatedAt,
      },
    );
    await client.mutation(
      api["hookLabIdeaVariants/completeFromMediaWorker"]
        .completeFromMediaWorker,
      {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.hookLabIdeaVariantId,
        generatedUgcClipId: input.clipId,
        finishedStitchId: input.stitchId,
        updatedAt,
      },
    );
    await client.mutation(api.providerJobs.markMediaStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: input.providerJobId,
      status: "completed",
      stage: "completed",
      outputAssetId: input.stitchId,
      mediaJobId: job.id,
      progress: 1,
      updatedAt,
    });
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "completed",
      stage: "completed",
      outputAssetId: input.stitchId,
      updatedAt,
    });
    await Promise.allSettled(
      getHookLabMediaJobTemporaryObjects(job).map((object) =>
        deleteR2Object({ client: r2, config, key: object.key }),
      ),
    );
  } catch (error) {
    if (!clipSaved) {
      const persistedClip = await client
        .query(
          api["videoClips/getHookLabVariantForMediaWorker"]
            .getHookLabVariantForMediaWorker,
          {
            secret: config.mediaWorkerSecret,
            ownerId: job.ownerId,
            id: input.clipId,
          },
        )
        .catch(() => null);

      if (!persistedClip) {
        await Promise.allSettled(
          [videoKey, posterKey].map((key) =>
            deleteR2Object({ client: r2, config, key }),
          ),
        );
      }
    }

    throw error;
  } finally {
    await rm(scratchDir, { force: true, recursive: true });
  }
}
