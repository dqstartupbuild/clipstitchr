import type { Doc } from "@/convex/_generated/dataModel";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createStitchScorePrompt } from "@/lib/clipstitchr/server/createStitchScorePrompt";
import { createUploadAnalysisPredictionOutputText } from "@/lib/clipstitchr/server/createUploadAnalysisPredictionOutputText";

const STITCH_SCORE_FALLBACK_SYSTEM_PROMPT =
  "You review short-form stitched ad videos from a poster frame, saved settings, and source notes. Give simple, grounded editing guidance.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createStitchScoreFallbackOutputText({
  posterFile,
  replicate,
  sourceClips,
  stitch,
}: {
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
  return await createUploadAnalysisPredictionOutputText({
    failureMessage: "Replicate did not complete stitch score fallback analysis.",
    imageInput: posterInput,
    maxCompletionTokens: 1400,
    prompt: createStitchScorePrompt({
      sourceClips,
      stitch,
      videoInputDescription: posterInput
        ? "Video analysis was unavailable. Use the rendered stitch poster plus saved stitch settings and source clip notes."
        : "Video analysis was unavailable. Use saved stitch settings and source clip notes only.",
    }),
    replicate,
    systemPrompt: STITCH_SCORE_FALLBACK_SYSTEM_PROMPT,
  });
}
