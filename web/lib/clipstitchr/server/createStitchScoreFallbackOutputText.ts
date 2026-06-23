import type { Doc } from "@/convex/_generated/dataModel";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createStitchScorePrompt } from "@/lib/clipstitchr/server/createStitchScorePrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadAnalysisModelId } from "@/lib/clipstitchr/server/getUploadAnalysisModelId";
import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";

const STITCH_SCORE_FALLBACK_SYSTEM_PROMPT =
  "You review short-form stitched ad videos from a poster frame, saved settings, and source notes. Give simple, grounded editing guidance.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createStitchScoreFallbackOutputText({
  detectorCandidates = [],
  posterFile,
  replicate,
  sourceClips,
  stitch,
}: {
  detectorCandidates?: QuickEditCandidate[];
  posterFile?: File;
  replicate: ReplicateClient;
  sourceClips: Doc<"videoClips">[];
  stitch: Doc<"stitches">;
}) {
  const posterInput = posterFile
    ? createReplicateInputFile({
        fallbackFileName: "stitch-score-poster.jpg",
        file: posterFile,
        mimeType: "image/jpeg",
      })
    : undefined;
  const prediction = await replicate.predictions.create({
    model: getUploadAnalysisModelId(),
    input: {
      ...(posterInput ? { image_input: [posterInput] } : {}),
      prompt: createStitchScorePrompt({
        detectorCandidates,
        sourceClips,
        stitch,
        videoInputDescription: posterInput
          ? "Video analysis was unavailable. Use the rendered stitch poster plus saved stitch settings and source clip notes."
          : "Video analysis was unavailable. Use saved stitch settings and source clip notes only.",
      }),
      system_prompt: STITCH_SCORE_FALLBACK_SYSTEM_PROMPT,
      temperature: 0.2,
      max_completion_tokens: 1400,
    },
  });

  return await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete stitch score fallback analysis.",
    prediction,
    replicate,
  });
}
