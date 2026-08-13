import type { StudioClipsFailure } from "../contracts/StudioClipsFailure";
import { redactStudioClipsSensitiveText } from "../security/redactStudioClipsSensitiveText";
import { StudioClipsWorkerError } from "./StudioClipsWorkerError";

const retryableNetworkCodes = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
]);

export function classifyStudioClipsFailure(
  error: unknown,
  attempt: number,
): StudioClipsFailure {
  if (error instanceof StudioClipsWorkerError) {
    return {
      code: error.code.replace(/[^A-Z0-9_]/gi, "_").slice(0, 64),
      kind: error.kind,
      message: redactStudioClipsSensitiveText(error.publicMessage).slice(0, 240),
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
  const isTransient =
    candidate?.name === "AbortError" ||
    retryableNetworkCodes.has(code) ||
    status === 408 ||
    status === 409 ||
    status === 425 ||
    status === 429 ||
    status >= 500;
  const isPermanentHttpFailure =
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 410 ||
    status === 413 ||
    status === 415 ||
    status === 422;
  const retriesRemain = attempt < 5;

  return {
    code: isPermanentHttpFailure
      ? "PERMANENT_PROVIDER_FAILURE"
      : isTransient
      ? "TRANSIENT_PROVIDER_FAILURE"
      : retriesRemain
        ? "UNEXPECTED_RETRYABLE_FAILURE"
        : "ATTEMPTS_EXHAUSTED",
    kind:
      !isPermanentHttpFailure && (isTransient || retriesRemain)
        ? "retryable"
        : "permanent",
    message:
      !isPermanentHttpFailure && (isTransient || retriesRemain)
        ? "Studio Clips hit a temporary processing problem."
        : isPermanentHttpFailure
          ? "Studio Clips received an unsupported provider response."
          : "Studio Clips could not finish after the allowed attempts.",
  };
}
