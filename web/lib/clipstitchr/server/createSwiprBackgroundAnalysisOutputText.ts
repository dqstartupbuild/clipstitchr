import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createSwiprBackgroundAnalysisPrompt } from "@/lib/clipstitchr/server/createSwiprBackgroundAnalysisPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadAnalysisModelId } from "@/lib/clipstitchr/server/getUploadAnalysisModelId";

const SWIPR_BACKGROUND_ANALYSIS_SYSTEM_PROMPT =
  "You create concise, searchable metadata for shared carousel backgrounds.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprBackgroundAnalysisOutputText({
  file,
  originalName,
  replicate,
}: {
  file: File;
  originalName: string;
  replicate: ReplicateClient;
}) {
  const imageFile = createReplicateInputFile({
    fallbackFileName: "swipr-background-analysis.jpg",
    file,
    mimeType: "image/jpeg",
  });
  const prediction = await replicate.predictions.create({
    model: getUploadAnalysisModelId(),
    input: {
      image_input: [imageFile],
      prompt: createSwiprBackgroundAnalysisPrompt(originalName),
      system_prompt: SWIPR_BACKGROUND_ANALYSIS_SYSTEM_PROMPT,
      temperature: 0.2,
      max_completion_tokens: 700,
    },
  });

  return await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete Swipr background analysis.",
    prediction,
    replicate,
  });
}
