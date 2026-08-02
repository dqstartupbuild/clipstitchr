const SAFE_CODE_PATTERN = /^[a-z][a-z0-9_]{0,63}$/u;

export const readSafePublishingOutboxErrorCode = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "safeCode" in error &&
    typeof error.safeCode === "string" &&
    SAFE_CODE_PATTERN.test(error.safeCode)
  ) {
    return error.safeCode;
  }

  return "worker_unavailable";
};
