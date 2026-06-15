import type { GeminiVideoAnalysisFeaturePath } from "@/lib/clipstitchr/types/GeminiVideoAnalysisFeaturePath";
import type { GeminiVideoAnalysisInputMode } from "@/lib/clipstitchr/types/GeminiVideoAnalysisInputMode";

export type GeminiVideoAnalysisInputDiagnostics = {
  featurePath: GeminiVideoAnalysisFeaturePath;
  inputMode: GeminiVideoAnalysisInputMode;
  objectContentType?: string;
  objectKey?: string;
  objectSize?: number;
  signedUrlExpiresSeconds?: number;
  sourceUrl?: string;
};
