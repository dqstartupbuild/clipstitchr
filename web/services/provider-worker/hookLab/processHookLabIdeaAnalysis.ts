import { anyApi } from "convex/server";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { analyzeHookLabOwnedSource } from "./analyzeHookLabOwnedSource";
import { analyzeHookLabSocialSource } from "./analyzeHookLabSocialSource";
import {
  HOOK_LAB_ANALYSIS_PROMPT_VERSION,
  HOOK_LAB_ANALYSIS_VERSION,
} from "./hookLabAnalysisConstants";
import type { HookLabAnalysisInput } from "./HookLabAnalysisInput";
import { markHookLabAnalysisJobStatus } from "./markHookLabAnalysisJobStatus";
import { parseHookLabIdeaAnalysisJobInput } from "./parseHookLabIdeaAnalysisJobInput";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";

const api = anyApi;

export async function processHookLabIdeaAnalysis({
  client,
  job,
  providerWorkerSecret,
}: ProcessHookLabIdeaAnalysisOptions) {
  const { ideaId } = parseHookLabIdeaAnalysisJobInput(job.inputSnapshotJson);
  const analysisInput = (await client.query(
    api["hookLabIdeas/getForProvider"].getForProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: ideaId,
    },
  )) as HookLabAnalysisInput | null;

  if (!analysisInput?.idea) {
    throw new Error("Hook Lab idea was not found for analysis.");
  }

  const { idea } = analysisInput;
  const analysis =
    idea.sourceType === "social_link"
      ? await analyzeHookLabSocialSource({
          client,
          idea,
          job,
          providerWorkerSecret,
        })
      : await analyzeHookLabOwnedSource({
          analysisInput,
          client,
          idea,
          job,
          providerWorkerSecret,
        });

  if (!analysis) {
    return;
  }

  const updatedAt = new Date().toISOString();
  const socialMetadata = analysis as typeof analysis & {
    attributionName?: string;
    attributionUrl?: string;
    canonicalUrl?: string;
    providerDatasetId?: string;
    providerRunId?: string;
    sourceCreatedAt?: string;
    sourcePostId?: string;
    thumbnailObject?: R2ObjectReference;
  };

  try {
    await client.mutation(
      api["hookLabIdeas/completeAnalysisFromProvider"]
        .completeAnalysisFromProvider,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: idea.id,
        name: analysis.name,
        canonicalUrl: socialMetadata.canonicalUrl,
        sourcePostId: socialMetadata.sourcePostId,
        sourceCreatedAt: socialMetadata.sourceCreatedAt,
        attributionName: socialMetadata.attributionName,
        attributionUrl: socialMetadata.attributionUrl,
        thumbnailObject: socialMetadata.thumbnailObject,
        originalText: analysis.originalText,
        textBlueprint: analysis.textBlueprint,
        creativeBeat: analysis.creativeBeat,
        whatToRepeat: analysis.whatToRepeat,
        analysisModel: analysis.modelId,
        providerPredictionId: analysis.predictionId,
        providerRunId: socialMetadata.providerRunId,
        providerDatasetId: socialMetadata.providerDatasetId,
        promptVersion: HOOK_LAB_ANALYSIS_PROMPT_VERSION,
        analysisVersion: HOOK_LAB_ANALYSIS_VERSION,
        updatedAt,
      },
    );
  } catch (error) {
    if (socialMetadata.thumbnailObject) {
      const latestInput = (await client
        .query(api["hookLabIdeas/getForProvider"].getForProvider, {
          secret: providerWorkerSecret,
          ownerId: job.ownerId,
          id: idea.id,
        })
        .catch(() => null)) as HookLabAnalysisInput | null;
      const attachedThumbnailKey = latestInput?.idea.thumbnailObject?.key;

      if (attachedThumbnailKey !== socialMetadata.thumbnailObject.key) {
        await deleteR2Object(socialMetadata.thumbnailObject.key).catch(
          () => undefined,
        );
      }
    }

    throw error;
  }
  await markHookLabAnalysisJobStatus({
    client,
    job,
    progress: 1,
    providerJobId: analysis.predictionId,
    providerWorkerSecret,
    stage: "completed",
    status: "completed",
  });
}
