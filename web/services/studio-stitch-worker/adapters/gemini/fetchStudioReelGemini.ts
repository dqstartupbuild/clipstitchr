import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export async function fetchStudioReelGemini(input: {
  fetch?: typeof fetch;
  init: RequestInit & { duplex?: "half" };
  timeoutMs?: number;
  url: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? 120_000,
  );
  try {
    return await (input.fetch ?? fetch)(input.url, {
      ...input.init,
      signal: controller.signal,
    });
  } catch (error) {
    throw new StudioReelWorkerError({
      cause: error,
      code: "GEMINI_UNAVAILABLE",
      kind: "retryable",
      publicMessage: "Gemini is temporarily unavailable.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
