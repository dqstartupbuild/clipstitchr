import type { Doc } from "@/convex/_generated/dataModel";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchScorePrompt } from "@/lib/clipstitchr/server/createStitchScorePrompt";
import { createStitchScoreVideoInputs } from "@/lib/clipstitchr/server/createStitchScoreVideoInputs";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";

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
  const prediction = await replicate.predictions.create({
    model: getUploadVideoAnalysisModelId(),
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
    replicate,
  });
}
