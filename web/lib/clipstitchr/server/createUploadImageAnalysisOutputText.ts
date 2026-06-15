import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createUploadAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadAnalysisPrompt";
import { createUploadAnalysisPredictionOutputText } from "@/lib/clipstitchr/server/createUploadAnalysisPredictionOutputText";
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
  const imageFile = createReplicateInputFile({
    fallbackFileName: "upload-analysis.jpg",
    file,
    mimeType: "image/jpeg",
  });

  return await createUploadAnalysisPredictionOutputText({
    failureMessage: "Replicate did not complete upload analysis.",
    imageInput: imageFile,
    maxCompletionTokens:
      mediaKind === "demo-video" || mediaKind === "ugc-video" ? 700 : 400,
    prompt: createUploadAnalysisPrompt({ mediaKind, originalName }),
    replicate,
    systemPrompt: UPLOAD_ANALYSIS_SYSTEM_PROMPT,
  });
}
