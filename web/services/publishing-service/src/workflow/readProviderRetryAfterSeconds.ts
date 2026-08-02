import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";

export const readProviderRetryAfterSeconds = (error: unknown): number => {
  if (
    error instanceof ProviderRuntimeError &&
    error.retryAfterSeconds !== undefined
  ) {
    return Math.min(Math.max(error.retryAfterSeconds, 1), 3_600);
  }

  return 60;
};
