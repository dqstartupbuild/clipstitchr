import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getValidatedHookLabR2VideoUrl } from "@/lib/clipstitchr/server/hookLab/getValidatedHookLabR2VideoUrl";
import { createHookLabIdeaAnalysis } from "./createHookLabIdeaAnalysis";
import { getHookLabAnalysisSourceContext } from "./getHookLabAnalysisSourceContext";
import { getHookLabImportedVideoMaxBytes } from "./getHookLabImportedVideoMaxBytes";
import { getHookLabStitchOriginalText } from "./getHookLabStitchOriginalText";
import type { HookLabAnalysisInput } from "./HookLabAnalysisInput";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";
import type { ProcessHookLabIdeaAnalysisOptions } from "./ProcessHookLabIdeaAnalysisOptions";
import { recordHookLabAnalysisPrediction } from "./recordHookLabAnalysisPrediction";

type AnalyzeHookLabOwnedSourceOptions = ProcessHookLabIdeaAnalysisOptions & {
  analysisInput: HookLabAnalysisInput;
  idea: HookLabIdeaDocument;
};

export async function analyzeHookLabOwnedSource({
  analysisInput,
  client,
  idea,
  job,
  providerWorkerSecret,
}: AnalyzeHookLabOwnedSourceOptions) {
  const originalText =
    idea.originalText ?? getHookLabStitchOriginalText(analysisInput.sourceStitch);
  const sourceContext = getHookLabAnalysisSourceContext(analysisInput);
  const videoObject = analysisInput.sourceUgcClip?.videoObject;
  const shouldReadVideo =
    Boolean(videoObject) && !analysisInput.sourceUgcClip?.poseDescription;
  const videoUrl =
    shouldReadVideo && videoObject
      ? await getValidatedHookLabR2VideoUrl({
          maxBytes: getHookLabImportedVideoMaxBytes(),
          object: videoObject,
          timeoutMs: 60_000,
          userId: job.ownerId,
        })
      : undefined;
  const analysis = await createHookLabIdeaAnalysis({
    onPredictionCreated: (prediction) =>
      recordHookLabAnalysisPrediction({
        client,
        job,
        predictionId: prediction.id,
        providerWorkerSecret,
      }),
    originalText,
    replicate: createReplicateClient(),
    sourceContext,
    sourceType: idea.sourceType,
    videoUrl,
  });

  return {
    ...analysis,
    thumbnailObject: analysisInput.sourceUgcClip?.posterObject,
  };
}
