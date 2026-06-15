import { readGeminiVideoAnalysisHeadDiagnostics } from "@/lib/clipstitchr/server/readGeminiVideoAnalysisHeadDiagnostics";
import { readGeminiVideoAnalysisRangeDiagnostics } from "@/lib/clipstitchr/server/readGeminiVideoAnalysisRangeDiagnostics";

export async function readGeminiVideoAnalysisUrlDiagnostics(sourceUrl: string) {
  const [headDiagnostics, rangeDiagnostics] = await Promise.all([
    readGeminiVideoAnalysisHeadDiagnostics(sourceUrl),
    readGeminiVideoAnalysisRangeDiagnostics(sourceUrl),
  ]);

  return {
    ...headDiagnostics,
    ...rangeDiagnostics,
  };
}
