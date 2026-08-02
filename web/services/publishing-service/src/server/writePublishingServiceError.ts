import type { ServerResponse } from "node:http";

import { PublishingRateLimitExceededError } from "../errors/PublishingRateLimitExceededError.js";
import { PublishingRateLimitStorageError } from "../errors/PublishingRateLimitStorageError.js";
import { PublishingServiceHttpError } from "./PublishingServiceHttpError.js";
import { writeJsonResponse } from "./writeJsonResponse.js";

export const writePublishingServiceError = (
  response: ServerResponse,
  error: unknown,
): void => {
  if (error instanceof PublishingRateLimitExceededError) {
    response.setHeader("Retry-After", error.retryAfterSeconds);
    writeJsonResponse(response, 429, {
      code: "rate_limited",
      message: "Too many publishing requests. Try again shortly.",
      retryAfterSeconds: error.retryAfterSeconds,
    });
    return;
  }

  if (error instanceof PublishingRateLimitStorageError) {
    writeJsonResponse(response, 503, {
      code: "protection_unavailable",
      message: "Publishing is temporarily unavailable.",
    });
    return;
  }

  if (error instanceof PublishingServiceHttpError) {
    const retryAfterSeconds =
      error.status === 429 &&
      error.retryAfterSeconds !== undefined &&
      Number.isSafeInteger(error.retryAfterSeconds) &&
      error.retryAfterSeconds >= 1 &&
      error.retryAfterSeconds <= 86_400
        ? error.retryAfterSeconds
        : undefined;

    if (retryAfterSeconds !== undefined) {
      response.setHeader("Retry-After", retryAfterSeconds);
    }
    writeJsonResponse(response, error.status, {
      code: error.code,
      message:
        error.status === 401
          ? "Sign in again to continue."
          : "Publishing could not complete that request.",
      ...(retryAfterSeconds !== undefined
        ? { retryAfterSeconds }
        : {}),
    });
    return;
  }

  writeJsonResponse(response, 500, {
    code: "internal_error",
    message: "Publishing could not complete that request.",
  });
};
