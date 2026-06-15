import { getGeminiVideoAnalysisErrorMessage } from "@/lib/clipstitchr/server/getGeminiVideoAnalysisErrorMessage";

export async function readGeminiVideoAnalysisHeadDiagnostics(sourceUrl: string) {
  try {
    const response = await fetch(sourceUrl, { method: "HEAD" });

    return {
      headAcceptRanges: response.headers.get("accept-ranges") ?? undefined,
      headContentLength: response.headers.get("content-length") ?? undefined,
      headContentType: response.headers.get("content-type") ?? undefined,
      headOk: response.ok,
      headStatus: response.status,
    };
  } catch (error) {
    return {
      headError: getGeminiVideoAnalysisErrorMessage(error),
      headOk: false,
    };
  }
}
