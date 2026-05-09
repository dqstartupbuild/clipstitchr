import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createUploadAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadAnalysisPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadAnalysisModelId } from "@/lib/clipstitchr/server/getUploadAnalysisModelId";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

const UPLOAD_ANALYSIS_SYSTEM_PROMPT =
  "You create concise, searchable metadata for uploaded marketing media.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createUploadImageAnalysisOutputText({
  file,
  mediaKind,
  originalName,
  replicate,
}: {
  file: File;
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
  replicate: ReplicateClient;
}) {
  const prediction = await replicate.predictions.create({
    model: getUploadAnalysisModelId(),
    input: {
      image_input: [file],
      prompt: createUploadAnalysisPrompt({ mediaKind, originalName }),
      system_prompt: UPLOAD_ANALYSIS_SYSTEM_PROMPT,
      temperature: 0.2,
      max_completion_tokens:
        mediaKind === "demo-video" || mediaKind === "ugc-video" ? 700 : 400,
    },
  });

  return await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete upload analysis.",
    prediction,
    replicate,
  });
}
