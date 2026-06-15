import { redactGeminiVideoAnalysisMessage } from "@/lib/clipstitchr/server/redactGeminiVideoAnalysisMessage";

export function getGeminiVideoAnalysisErrorMessage(error: unknown) {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return redactGeminiVideoAnalysisMessage(error.message);
  }

  if (typeof error === "string") {
    return redactGeminiVideoAnalysisMessage(error);
  }

  try {
    return redactGeminiVideoAnalysisMessage(JSON.stringify(error));
  } catch {
    return "Unknown error";
  }
}
