import { deleteHookLabTemporaryVideo } from "@/lib/clipstitchr/server/hookLab/deleteHookLabTemporaryVideo";
import { fetchHookLabRemoteVideo } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteVideo";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { assertHookLabVideoDuration } from "./assertHookLabVideoDuration";
import { createHookLabIdeaAnalysis } from "./createHookLabIdeaAnalysis";
import { createHookLabVideoThumbnail } from "./createHookLabVideoThumbnail";
import { getHookLabImportedVideoMaxBytes } from "./getHookLabImportedVideoMaxBytes";
import { getHookLabVideoDuration } from "./getHookLabVideoDuration";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";
import { loadHookLabSocialSource } from "./loadHookLabSocialSource";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";
import { markHookLabAnalysisJobStatus } from "./markHookLabAnalysisJobStatus";
import { saveHookLabThumbnail } from "./saveHookLabThumbnail";
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

  try {
    const duration = await getHookLabVideoDuration(temporaryVideoPath);

    assertHookLabVideoDuration(duration);
    const videoFile = new File(
      [
        fetchedVideo.bytes.buffer.slice(
          fetchedVideo.bytes.byteOffset,
          fetchedVideo.bytes.byteOffset + fetchedVideo.bytes.byteLength,
        ) as ArrayBuffer,
      ],
      `${idea.id}.mp4`,
      { type: fetchedVideo.contentType },
    );
    const [analysis, thumbnailResult] = await Promise.all([
      createHookLabIdeaAnalysis({
        originalText: source.sourceText ?? idea.originalText,
        replicate: createReplicateClient(),
        sourceContext: {
          durationSeconds: duration,
          platform: source.platform,
          sourceCreatedAt: source.sourceCreatedAt,
        },
        sourceType: idea.sourceType,
        videoFile,
      }),
      createHookLabVideoThumbnail(temporaryVideoPath).catch(() => null),
    ]);
    let thumbnailObject: R2ObjectReference | undefined;

    if (thumbnailResult) {
      temporaryThumbnailPath = thumbnailResult.filePath;
      thumbnailObject = await saveHookLabThumbnail({
        body: thumbnailResult.body,
        ideaId: idea.id,
        ownerId: job.ownerId,
      }).catch(() => undefined);
    }

    return {
      ...analysis,
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
    await Promise.allSettled([
      deleteHookLabTemporaryVideo({ filePath: temporaryVideoPath }),
      temporaryThumbnailPath
        ? deleteHookLabTemporaryVideo({ filePath: temporaryThumbnailPath })
        : Promise.resolve(),
    ]);
  }
}
