import { deleteHookLabTemporaryVideo } from "@/lib/clipstitchr/server/hookLab/deleteHookLabTemporaryVideo";
import { fetchHookLabRemoteVideo } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteVideo";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { assertHookLabVideoDuration } from "./assertHookLabVideoDuration";
import { createHookLabIdeaAnalysis } from "./createHookLabIdeaAnalysis";
import { createHookLabVideoThumbnail } from "./createHookLabVideoThumbnail";
import { deleteHookLabTemporarySourceVideo } from "./deleteHookLabTemporarySourceVideo";
import { getHookLabImportedVideoMaxBytes } from "./getHookLabImportedVideoMaxBytes";
import { getHookLabVideoDuration } from "./getHookLabVideoDuration";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";
import { loadHookLabSocialSource } from "./loadHookLabSocialSource";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";
import { markHookLabAnalysisJobStatus } from "./markHookLabAnalysisJobStatus";
import { recordHookLabAnalysisPrediction } from "./recordHookLabAnalysisPrediction";
import { saveHookLabThumbnail } from "./saveHookLabThumbnail";
import { saveHookLabTemporarySourceVideo } from "./saveHookLabTemporarySourceVideo";
import { writeHookLabTemporaryVideo } from "./writeHookLabTemporaryVideo";

export async function analyzeHookLabSocialSource({
  client,
  idea,
  job,
  providerWorkerSecret,
}: ProcessHookLabIdeaAnalysisOptions & { idea: HookLabIdeaDocument }) {
  const source = await loadHookLabSocialSource({
    client,
    idea,
    job,
    providerWorkerSecret,
  });

  if (!source) {
    return null;
  }
  if (!source.temporaryVideoUrl) {
    throw new Error(`${source.platform} does not expose a usable source video.`);
  }

  await markHookLabAnalysisJobStatus({
    client,
    job,
    progress: 0.35,
    providerWorkerSecret,
    stage: "hook-lab-analyzing-source",
    status: "running",
  });

  const fetchedVideo = await fetchHookLabRemoteVideo({
    maxBytes: getHookLabImportedVideoMaxBytes(),
    timeoutMs: 60_000,
    url: source.temporaryVideoUrl,
  });
  const temporaryVideoPath = await writeHookLabTemporaryVideo(
    fetchedVideo.bytes,
  );
  let temporaryThumbnailPath: string | undefined;
  let temporaryVideoObject: R2ObjectReference | undefined;

  try {
    const duration = await getHookLabVideoDuration(temporaryVideoPath);

    assertHookLabVideoDuration(duration);
    temporaryVideoObject = await saveHookLabTemporarySourceVideo({
      body: fetchedVideo.bytes,
      contentType: fetchedVideo.contentType,
      ownerId: job.ownerId,
      recordId: job.id,
    });
    const videoUrl = (
      await getR2DownloadSignedUrl(temporaryVideoObject.key)
    ).url;
    const [analysisResult, thumbnailTaskResult] = await Promise.allSettled([
      createHookLabIdeaAnalysis({
        onPredictionCreated: (prediction) =>
          recordHookLabAnalysisPrediction({
            client,
            job,
            predictionId: prediction.id,
            providerWorkerSecret,
          }),
        originalText: source.sourceText ?? idea.originalText,
        replicate: createReplicateClient(),
        sourceContext: {
          durationSeconds: duration,
          platform: source.platform,
          sourceCreatedAt: source.sourceCreatedAt,
        },
        sourceType: idea.sourceType,
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
        ideaId: idea.id,
        ownerId: job.ownerId,
      }).catch(() => undefined);
    }

    return {
      ...analysisResult.value,
      attributionName: source.authorName ?? source.authorUsername,
      attributionUrl: source.authorProfileUrl ?? source.canonicalUrl,
      canonicalUrl: source.canonicalUrl,
      providerDatasetId: idea.providerDatasetId,
      providerRunId: idea.providerRunId,
      sourceCreatedAt: source.sourceCreatedAt,
      sourcePostId: source.sourcePostId,
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
    const localSourceCleanup = cleanupResults[0];
    const localThumbnailCleanup = cleanupResults[1];
    const temporarySourceCleanup = cleanupResults[2];

    if (localSourceCleanup.status === "rejected") {
      console.error("Hook Lab local source video cleanup failed.");
    }

    if (localThumbnailCleanup.status === "rejected") {
      console.error("Hook Lab local thumbnail cleanup failed.");
    }

    if (temporarySourceCleanup.status === "rejected") {
      console.error("Hook Lab temporary source video cleanup failed.", {
        jobId: job.id,
      });
    }
  }
}
