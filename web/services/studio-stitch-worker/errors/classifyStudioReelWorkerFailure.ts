import type { StudioReelWorkerFailure } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerFailure";
import { redactStudioReelWorkerText } from "../security/redactStudioReelWorkerText";
import { StudioReelWorkerError } from "./StudioReelWorkerError";

const transientCodes = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
]);

export function classifyStudioReelWorkerFailure(
  error: unknown,
  runAttempt: number,
): StudioReelWorkerFailure {
  if (error instanceof StudioReelWorkerError) {
    return {
      code: error.code.replace(/[^A-Z0-9_]/gi, "_").slice(0, 64),
      kind: error.kind,
      message: redactStudioReelWorkerText(error.publicMessage).slice(0, 240),
    };
  }
  const candidate = error as {
    code?: unknown;
    name?: unknown;
    status?: unknown;
    statusCode?: unknown;
  };
  const status = Number(candidate?.status ?? candidate?.statusCode);
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const transient =
    candidate?.name === "AbortError" ||
    transientCodes.has(code) ||
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500;
  const permanent = [400, 401, 403, 404, 410, 413, 415, 422].includes(status);
  if (!permanent && (transient || runAttempt < 5)) {
    return {
      code: transient
        ? "TRANSIENT_EXECUTION_FAILURE"
        : "UNEXPECTED_RETRYABLE_FAILURE",
      kind: "retryable",
      message: "Studio Stitch hit a temporary execution problem.",
    };
  }
  return {
    code: permanent ? "PERMANENT_PROVIDER_FAILURE" : "ATTEMPTS_EXHAUSTED",
    kind: "permanent",
    message: permanent
      ? "Studio Stitch received an unsupported provider response."
      : "Studio Stitch could not finish after the allowed attempts.",
  };
}
