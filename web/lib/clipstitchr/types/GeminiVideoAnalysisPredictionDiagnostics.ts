import type { GeminiVideoAnalysisFeaturePath } from "@/lib/clipstitchr/types/GeminiVideoAnalysisFeaturePath";

export type GeminiVideoAnalysisPredictionDiagnostics = {
  featurePath: GeminiVideoAnalysisFeaturePath;
  modelId: string;
};
