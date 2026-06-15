import { getGeminiVideoAnalysisUrlHost } from "@/lib/clipstitchr/server/getGeminiVideoAnalysisUrlHost";
import { readGeminiVideoAnalysisUrlDiagnostics } from "@/lib/clipstitchr/server/readGeminiVideoAnalysisUrlDiagnostics";
import { redactGeminiVideoAnalysisR2Key } from "@/lib/clipstitchr/server/redactGeminiVideoAnalysisR2Key";
import type { GeminiVideoAnalysisInputDiagnostics } from "@/lib/clipstitchr/types/GeminiVideoAnalysisInputDiagnostics";

export async function logGeminiVideoAnalysisInputDiagnostics({
  diagnostics,
  modelId,
}: {
  diagnostics: GeminiVideoAnalysisInputDiagnostics;
  modelId: string;
}) {
  const urlDiagnostics = diagnostics.sourceUrl
    ? await readGeminiVideoAnalysisUrlDiagnostics(diagnostics.sourceUrl)
    : {};

  console.info(
    JSON.stringify({
      event: "gemini-video-analysis-input",
      featurePath: diagnostics.featurePath,
      modelId,
      inputMode: diagnostics.inputMode,
      urlHost: getGeminiVideoAnalysisUrlHost(diagnostics.sourceUrl),
      r2ObjectKey: redactGeminiVideoAnalysisR2Key(diagnostics.objectKey),
      objectContentType: diagnostics.objectContentType,
      objectSize: diagnostics.objectSize,
      signedUrlExpiresSeconds: diagnostics.signedUrlExpiresSeconds,
      ...urlDiagnostics,
    }),
  );
}
