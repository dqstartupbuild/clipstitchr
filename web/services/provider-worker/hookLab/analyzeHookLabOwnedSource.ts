import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createHookLabFileFromR2Object } from "@/lib/clipstitchr/server/hookLab/createHookLabFileFromR2Object";
import { createHookLabIdeaAnalysis } from "./createHookLabIdeaAnalysis";
import { getHookLabAnalysisSourceContext } from "./getHookLabAnalysisSourceContext";
import { getHookLabImportedVideoMaxBytes } from "./getHookLabImportedVideoMaxBytes";
import { getHookLabStitchOriginalText } from "./getHookLabStitchOriginalText";
import type { HookLabAnalysisInput } from "./HookLabAnalysisInput";
import type { HookLabAnalysisJob } from "./HookLabAnalysisJob";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";

type AnalyzeHookLabOwnedSourceOptions = {
  analysisInput: HookLabAnalysisInput;
  idea: HookLabIdeaDocument;
  job: HookLabAnalysisJob;
};

export async function analyzeHookLabOwnedSource({
  analysisInput,
  idea,
  job,
}: AnalyzeHookLabOwnedSourceOptions) {
  const originalText =
    idea.originalText ?? getHookLabStitchOriginalText(analysisInput.sourceStitch);
  const sourceContext = getHookLabAnalysisSourceContext(analysisInput);
  const videoObject = analysisInput.sourceUgcClip?.videoObject;
  const shouldReadVideo =
    Boolean(videoObject) && !analysisInput.sourceUgcClip?.poseDescription;
  const videoFile =
    shouldReadVideo && videoObject
      ? await createHookLabFileFromR2Object({
          fallbackFileName:
            analysisInput.sourceUgcClip?.originalName || "hook-lab-stitch.mp4",
          maxBytes: getHookLabImportedVideoMaxBytes(),
          object: videoObject,
          timeoutMs: 60_000,
          userId: job.ownerId,
        })
      : undefined;
  const analysis = await createHookLabIdeaAnalysis({
    originalText,
    replicate: createReplicateClient(),
    sourceContext,
    sourceType: idea.sourceType,
    videoFile,
  });

  return {
    ...analysis,
    thumbnailObject: analysisInput.sourceUgcClip?.posterObject,
  };
}
