import { anyApi } from "convex/server";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { analyzeHookLabPost } from "./analyzeHookLabPost";
import {
  HOOK_LAB_ANALYSIS_PROMPT_VERSION,
  HOOK_LAB_ANALYSIS_VERSION,
} from "./hookLabAnalysisConstants";
import { markHookLabPostAnalysisJobStatus } from "./markHookLabPostAnalysisJobStatus";
import { parseHookLabPostAnalysisJobInput } from "./parseHookLabPostAnalysisJobInput";
import type { ProcessHookLabPostAnalysisOptions } from "./ProcessHookLabPostAnalysisOptions";

const api = anyApi;

export async function processHookLabPostAnalysis({
  client,
  job,
  providerWorkerSecret,
}: ProcessHookLabPostAnalysisOptions) {
  const { postId } = parseHookLabPostAnalysisJobInput(job.inputSnapshotJson);
  const post = await client.query(api["hookLabPosts/getForProvider"].getForProvider, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: postId,
  });

  if (!post) {
    throw new Error("Hook Lab post was not found for analysis.");
  }

  const result = await analyzeHookLabPost({
    client,
    job,
    post,
    providerWorkerSecret,
  });

  if (!result) {
    return;
  }

  try {
    await client.mutation(
      api["hookLabPosts/completeAnalysisFromProvider"]
        .completeAnalysisFromProvider,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: post.id,
        analysis: result.analysis,
        analysisModel: result.modelId,
        analysisVersion: HOOK_LAB_ANALYSIS_VERSION,
        analyzedAt: new Date().toISOString(),
        authorName: result.authorName,
        authorProfileUrl: result.authorProfileUrl,
        authorUsername: result.authorUsername,
        canonicalUrl: result.canonicalUrl,
        durationSeconds: result.durationSeconds,
        metrics: result.metrics,
        promptVersion: HOOK_LAB_ANALYSIS_PROMPT_VERSION,
        providerDatasetId: result.providerDatasetId,
        providerPredictionId: result.predictionId,
        providerRunId: result.providerRunId,
        sourceCreatedAt: result.sourceCreatedAt,
        sourcePostId: result.sourcePostId,
        sourceText: result.sourceText,
        thumbnailObject: result.thumbnailObject,
      },
    );
  } catch (error) {
    if (result.thumbnailObject) {
      const latestPost = await client
        .query(api["hookLabPosts/getForProvider"].getForProvider, {
          secret: providerWorkerSecret,
          ownerId: job.ownerId,
          id: post.id,
        })
        .catch(() => null);

      if (latestPost?.thumbnailObject?.key !== result.thumbnailObject.key) {
        await deleteR2Object(result.thumbnailObject.key).catch(() => undefined);
      }
    }

    throw error;
  }

  await markHookLabPostAnalysisJobStatus({
    client,
    job,
    progress: 1,
    providerJobId: result.predictionId,
    providerWorkerSecret,
    stage: "completed",
    status: "completed",
  });
}
