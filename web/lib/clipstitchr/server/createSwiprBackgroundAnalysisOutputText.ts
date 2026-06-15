import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createSwiprBackgroundAnalysisPrompt } from "@/lib/clipstitchr/server/createSwiprBackgroundAnalysisPrompt";
import { createUploadAnalysisPredictionOutputText } from "@/lib/clipstitchr/server/createUploadAnalysisPredictionOutputText";

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

  return await createUploadAnalysisPredictionOutputText({
    failureMessage: "Replicate did not complete Swipr background analysis.",
    imageInput: imageFile,
    maxCompletionTokens: 700,
    prompt: createSwiprBackgroundAnalysisPrompt(originalName),
    replicate,
    systemPrompt: SWIPR_BACKGROUND_ANALYSIS_SYSTEM_PROMPT,
  });
}
