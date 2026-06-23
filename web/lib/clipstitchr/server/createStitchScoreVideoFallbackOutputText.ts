import type { Doc } from "@/convex/_generated/dataModel";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createQwenVideoFallbackPredictionInput } from "@/lib/clipstitchr/server/createQwenVideoFallbackPredictionInput";
import { createStitchScorePrompt } from "@/lib/clipstitchr/server/createStitchScorePrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { getUploadVideoFallbackAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoFallbackAnalysisModelId";
import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import { parseStitchScore } from "@/lib/clipstitchr/utils/parseStitchScore";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createStitchScoreVideoFallbackOutputText({
  detectorCandidates = [],
  replicate,
  sourceClips,
  stitch,
  videoInput,
  videoInputDescription,
}: {
  detectorCandidates?: QuickEditCandidate[];
  replicate: ReplicateClient;
  sourceClips: Doc<"videoClips">[];
  stitch: Doc<"stitches">;
  videoInput: string;
  videoInputDescription: string;
}) {
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(
      getUploadVideoFallbackAnalysisModelId(),
    ),
    input: createQwenVideoFallbackPredictionInput({
      videoInput,
      prompt: [
        createStitchScorePrompt({
          detectorCandidates,
          sourceClips,
          stitch,
          videoInputDescription,
        }),
        "Keep the JSON compact enough to fit under 512 output tokens.",
      ].join("\n"),
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage:
      "Replicate did not complete fallback stitch score video analysis.",
    prediction,
    replicate,
  });

  if (!parseStitchScore(outputText)) {
    throw new Error("Fallback stitch video analysis did not return a score.");
  }

  return outputText;
}
