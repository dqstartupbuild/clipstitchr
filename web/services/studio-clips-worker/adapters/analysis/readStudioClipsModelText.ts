import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function readStudioClipsModelText(
  provider: "google" | "openai",
  payload: unknown,
): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS_PROVIDER_RESPONSE",
      kind: "permanent",
      publicMessage: "The analysis provider returned an invalid result.",
    });
  }
  const value = payload as Record<string, unknown>;
  if (provider === "google") {
    const candidates = Array.isArray(value.candidates) ? value.candidates : [];
    const candidate = candidates[0] as Record<string, unknown> | undefined;
    const content = candidate?.content as Record<string, unknown> | undefined;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    const text = (parts[0] as { text?: unknown } | undefined)?.text;
    if (typeof text === "string") return text;
  } else {
    const choices = Array.isArray(value.choices) ? value.choices : [];
    const choice = choices[0] as Record<string, unknown> | undefined;
    const message = choice?.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content;
  }
  throw new StudioClipsWorkerError({
    code: "EMPTY_ANALYSIS_PROVIDER_RESPONSE",
    kind: "retryable",
    publicMessage: "The analysis provider did not return clip candidates.",
  });
}
