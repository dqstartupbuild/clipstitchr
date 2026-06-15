import type { Doc } from "@/convex/_generated/dataModel";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchScoreFallbackOutputText } from "@/lib/clipstitchr/server/createStitchScoreFallbackOutputText";
import { createStitchScorePrompt } from "@/lib/clipstitchr/server/createStitchScorePrompt";
import { createStitchScorePosterFile } from "@/lib/clipstitchr/server/createStitchScorePosterFile";
import { createStitchScoreVideoInputs } from "@/lib/clipstitchr/server/createStitchScoreVideoInputs";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import { logGeminiVideoAnalysisInputDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisInputDiagnostics";
import { logGeminiVideoAnalysisPredictionDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisPredictionDiagnostics";

const STITCH_SCORE_SYSTEM_INSTRUCTION =
  "You review short-form stitched ad videos and give simple, grounded editing guidance.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createStitchScoreOutputText({
  replicate,
  sourceClips,
  stitch,
  userId,
}: {
  replicate: ReplicateClient;
  sourceClips: Doc<"videoClips">[];
  stitch: Doc<"stitches">;
  userId: string;
}) {
  const videoInputs = await createStitchScoreVideoInputs({
    sourceClips,
    stitch,
    userId,
  });

  if (!videoInputs.videos.length) {
    return await createStitchScoreFallbackOutputText({
      posterFile: await createStitchScorePosterFile({ stitch, userId }),
      replicate,
      sourceClips,
      stitch,
    });
  }

  const modelId = getUploadVideoAnalysisModelId();
  let prediction:
    | Awaited<ReturnType<ReplicateClient["predictions"]["create"]>>
    | undefined;

  try {
    if (videoInputs.diagnostics) {
      await logGeminiVideoAnalysisInputDiagnostics({
        diagnostics: videoInputs.diagnostics,
        modelId,
      });
    }

    prediction = await replicate.predictions.create({
      model: modelId,
      input: {
        ...(videoInputs.videos.length ? { videos: videoInputs.videos } : {}),
        prompt: createStitchScorePrompt({
          sourceClips,
          stitch,
          videoInputDescription: videoInputs.videoInputDescription,
        }),
        system_instruction: STITCH_SCORE_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        thinking_level: "low",
        max_output_tokens: 2200,
      },
    });

    return await getCompletedReplicatePredictionOutputText({
      failureMessage: "Replicate did not complete stitch score analysis.",
      prediction,
      predictionDiagnostics: videoInputs.diagnostics
        ? {
            featurePath: videoInputs.diagnostics.featurePath,
            modelId,
          }
        : undefined,
      replicate,
    });
  } catch (error) {
    if (videoInputs.diagnostics && !prediction) {
      logGeminiVideoAnalysisPredictionDiagnostics({
        diagnostics: {
          featurePath: videoInputs.diagnostics.featurePath,
          modelId,
        },
        error,
      });
    }

    return await createStitchScoreFallbackOutputText({
      posterFile: await createStitchScorePosterFile({ stitch, userId }),
      replicate,
      sourceClips,
      stitch,
    });
  }
}
