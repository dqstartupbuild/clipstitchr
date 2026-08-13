import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function readStudioReelGeminiText(payload: Record<string, unknown>) {
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const content = (candidates[0] as Record<string, unknown> | undefined)?.content;
  const parts =
    content && typeof content === "object" && !Array.isArray(content)
      ? (content as Record<string, unknown>).parts
      : null;
  const text = Array.isArray(parts)
    ? (parts[0] as Record<string, unknown> | undefined)?.text
    : null;
  if (typeof text !== "string" || text.length > 64 * 1024) {
    throw new StudioReelWorkerError({
      code: "GEMINI_RESPONSE_EMPTY",
      kind: "permanent",
      publicMessage: "Gemini returned no grounded demo analysis.",
    });
  }
  return text;
}
