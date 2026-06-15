import { getGeminiVideoAnalysisErrorMessage } from "@/lib/clipstitchr/server/getGeminiVideoAnalysisErrorMessage";

export async function readGeminiVideoAnalysisRangeDiagnostics(
  sourceUrl: string,
) {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        range: "bytes=0-15",
      },
    });

    return {
      rangeContentLength: response.headers.get("content-length") ?? undefined,
      rangeContentRange: response.headers.get("content-range") ?? undefined,
      rangeOk: response.ok,
      rangeStatus: response.status,
    };
  } catch (error) {
    return {
      rangeError: getGeminiVideoAnalysisErrorMessage(error),
      rangeOk: false,
    };
  }
}
