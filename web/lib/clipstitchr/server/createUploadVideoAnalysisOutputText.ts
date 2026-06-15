import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createUploadImageAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadImageAnalysisOutputText";
import { createUploadVideoAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadVideoAnalysisPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import { logGeminiVideoAnalysisInputDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisInputDiagnostics";
import { logGeminiVideoAnalysisPredictionDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisPredictionDiagnostics";
import type { GeminiVideoAnalysisInputDiagnostics } from "@/lib/clipstitchr/types/GeminiVideoAnalysisInputDiagnostics";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

const UPLOAD_VIDEO_ANALYSIS_SYSTEM_INSTRUCTION =
  "You create grounded, concise, searchable metadata and chronological action breakdowns for uploaded marketing videos.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createUploadVideoAnalysisOutputText({
  diagnostics,
  fallbackImageFile,
  file,
  mediaKind,
  originalName,
  replicate,
  sourceSizeBytes,
  sourceUrl,
}: {
  diagnostics?: GeminiVideoAnalysisInputDiagnostics;
  fallbackImageFile?: File;
  file?: File;
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
  replicate: ReplicateClient;
  sourceSizeBytes?: number;
  sourceUrl?: string;
}) {
  const videoInput =
    sourceUrl ||
    (file
      ? createReplicateInputFile({
          fallbackFileName: "upload-analysis.mp4",
          file,
          mimeType: "video/mp4",
        })
      : undefined);
  const videoSizeBytes = sourceSizeBytes ?? file?.size ?? 0;

  if (videoInput && videoSizeBytes <= MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES) {
    const modelId = getUploadVideoAnalysisModelId();
    let prediction:
      | Awaited<ReturnType<ReplicateClient["predictions"]["create"]>>
      | undefined;

    try {
      if (diagnostics) {
        await logGeminiVideoAnalysisInputDiagnostics({
          diagnostics,
          modelId,
        });
      }

      prediction = await replicate.predictions.create({
        model: modelId,
        input: {
          videos: [videoInput],
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
        predictionDiagnostics: diagnostics
          ? {
              featurePath: diagnostics.featurePath,
              modelId,
            }
          : undefined,
        replicate,
      });
    } catch (error) {
      if (diagnostics && !prediction) {
        logGeminiVideoAnalysisPredictionDiagnostics({
          diagnostics: {
            featurePath: diagnostics.featurePath,
            modelId,
          },
          error,
        });
      }

      if (!fallbackImageFile) {
        throw error;
      }
    }
  } else if (videoSizeBytes > MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES) {
    if (fallbackImageFile) {
      return await createUploadImageAnalysisOutputText({
        file: fallbackImageFile,
        mediaKind,
        originalName,
        replicate,
      });
    }

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
