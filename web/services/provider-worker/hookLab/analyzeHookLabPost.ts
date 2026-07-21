import { deleteHookLabTemporaryVideo } from "@/lib/clipstitchr/server/hookLab/deleteHookLabTemporaryVideo";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { assertHookLabVideoDuration } from "./assertHookLabVideoDuration";
import { createHookLabPostAnalysis } from "./createHookLabPostAnalysis";
import { createHookLabVideoThumbnail } from "./createHookLabVideoThumbnail";
import { deleteHookLabTemporarySourceVideo } from "./deleteHookLabTemporarySourceVideo";
import { getHookLabImportedVideoMaxBytes } from "./getHookLabImportedVideoMaxBytes";
import { getHookLabVideoDuration } from "./getHookLabVideoDuration";
import type { HookLabPostDocument } from "./HookLabPostDocument";
import { loadHookLabPostSource } from "./loadHookLabPostSource";
import { markHookLabPostAnalysisJobStatus } from "./markHookLabPostAnalysisJobStatus";
import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";
import { recordHookLabPostAnalysisPrediction } from "./recordHookLabPostAnalysisPrediction";
import { prepareHookLabSourceMedia } from "./prepareHookLabSourceMedia";
import { saveHookLabTemporarySourceVideo } from "./saveHookLabTemporarySourceVideo";
import { saveHookLabThumbnail } from "./saveHookLabThumbnail";

export async function analyzeHookLabPost({
  client,
  job,
  post,
  providerWorkerSecret,
}: ProcessHookLabPostAnalysisOptions & { post: HookLabPostDocument }) {
  const source = await loadHookLabPostSource({
    client,
    job,
    post,
    providerWorkerSecret,
  });

  if (!source) {
    return null;
  }

  await markHookLabPostAnalysisJobStatus({
    client,
    job,
    progress: 0.35,
    providerWorkerSecret,
    stage: "hook-lab-downloading-video",
    status: "running",
  });

  const preparedMedia = await prepareHookLabSourceMedia(
    source,
    getHookLabImportedVideoMaxBytes(),
  );
  const temporaryVideoPath = preparedMedia.filePath;
  let temporaryThumbnailPath: string | undefined;
  let temporaryVideoObject: R2ObjectReference | undefined;

  try {
    const durationSeconds =
      preparedMedia.durationSeconds ??
      (await getHookLabVideoDuration(temporaryVideoPath));

    assertHookLabVideoDuration(durationSeconds);
    temporaryVideoObject = await saveHookLabTemporarySourceVideo({
      body: preparedMedia.body,
      contentType: preparedMedia.contentType,
      ownerId: job.ownerId,
      recordId: job.id,
    });
    const videoUrl = (
      await getR2DownloadSignedUrl(temporaryVideoObject.key)
    ).url;
    const [analysisResult, thumbnailTaskResult] = await Promise.allSettled([
      createHookLabPostAnalysis({
        durationSeconds,
        metrics: source.metrics,
        mediaKind: source.mediaKind,
        onPredictionCreated: (prediction) =>
          recordHookLabPostAnalysisPrediction({
            client,
            job,
            predictionId: prediction.id,
            providerWorkerSecret,
          }),
        platform: source.platform,
        replicate: createReplicateClient(),
        sourceCreatedAt: source.sourceCreatedAt,
        sourceText: source.sourceText,
        videoUrl,
      }),
      createHookLabVideoThumbnail(temporaryVideoPath),
    ]);
    const thumbnailResult =
      thumbnailTaskResult.status === "fulfilled"
        ? thumbnailTaskResult.value
        : null;
    let thumbnailObject: R2ObjectReference | undefined;

    if (thumbnailResult) {
      temporaryThumbnailPath = thumbnailResult.filePath;
    }

    if (analysisResult.status === "rejected") {
      throw analysisResult.reason;
    }

    if (thumbnailResult) {
      thumbnailObject = await saveHookLabThumbnail({
        body: thumbnailResult.body,
        postId: post.id,
        ownerId: job.ownerId,
      }).catch(() => undefined);
    }

    return {
      ...analysisResult.value,
      authorName: source.authorName,
      authorProfileUrl: source.authorProfileUrl,
      authorUsername: source.authorUsername,
      canonicalUrl: source.canonicalUrl,
      durationSeconds,
      mediaKind: source.mediaKind,
      metrics: source.metrics,
      providerDatasetId: post.providerDatasetId,
      providerRunId: post.providerRunId,
      sourceCreatedAt: source.sourceCreatedAt,
      sourcePostId: source.sourcePostId,
      sourceText: source.sourceText,
      thumbnailObject,
    };
  } finally {
    const cleanupResults = await Promise.allSettled([
      deleteHookLabTemporaryVideo({ filePath: temporaryVideoPath }),
      temporaryThumbnailPath
        ? deleteHookLabTemporaryVideo({ filePath: temporaryThumbnailPath })
        : Promise.resolve(),
      temporaryVideoObject
        ? deleteHookLabTemporarySourceVideo({
            objectKey: temporaryVideoObject.key,
          })
        : Promise.resolve(),
    ]);

    if (cleanupResults[0].status === "rejected") {
      console.error("Hook Lab local source video cleanup failed.");
    }

    if (cleanupResults[1].status === "rejected") {
      console.error("Hook Lab local thumbnail cleanup failed.");
    }

    if (cleanupResults[2].status === "rejected") {
      console.error("Hook Lab temporary source video cleanup failed.", {
        jobId: job.id,
      });
    }
  }
}
