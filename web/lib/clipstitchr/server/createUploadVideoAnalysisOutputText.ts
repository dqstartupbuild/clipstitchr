import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createUploadImageAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadImageAnalysisOutputText";
import { createUploadVideoAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadVideoAnalysisPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

const UPLOAD_VIDEO_ANALYSIS_SYSTEM_INSTRUCTION =
  "You create grounded, concise, searchable metadata and chronological action breakdowns for uploaded marketing videos.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createUploadVideoAnalysisOutputText({
  fallbackImageFile,
  file,
  mediaKind,
  originalName,
  replicate,
}: {
  fallbackImageFile?: File;
  file: File;
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
  replicate: ReplicateClient;
}) {
  const videoFile = createReplicateInputFile({
    fallbackFileName: "upload-analysis.mp4",
    file,
    mimeType: "video/mp4",
  });

  if (file.size <= MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES) {
    try {
      const prediction = await replicate.predictions.create({
        model: getUploadVideoAnalysisModelId(),
        input: {
          videos: [videoFile],
          prompt: createUploadVideoAnalysisPrompt({ mediaKind, originalName }),
          system_instruction: UPLOAD_VIDEO_ANALYSIS_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          thinking_level: "low",
          max_output_tokens: 2800,
        },
      });

      return await getCompletedReplicatePredictionOutputText({
        failureMessage: "Replicate did not complete video upload analysis.",
        prediction,
        replicate,
      });
    } catch (error) {
      if (!fallbackImageFile) {
        throw error;
      }
    }
  } else if (!fallbackImageFile) {
    throw new Error(
      `Video analysis supports videos up to ${formatBytes(MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES)}.`,
    );
  }

  if (!fallbackImageFile) {
    throw new Error("Video poster fallback is unavailable.");
  }

  return await createUploadImageAnalysisOutputText({
    file: fallbackImageFile,
    mediaKind,
    originalName,
    replicate,
  });
}
