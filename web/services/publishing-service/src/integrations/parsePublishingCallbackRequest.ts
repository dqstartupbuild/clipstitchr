import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { PublishingCallbackRequest } from "./PublishingCallbackRequest.js";

const OAUTH_STATE_PATTERN = /^[A-Za-z0-9_-]{43}$/u;
const OAUTH_CODE_CONTROL_PATTERN = /[\u0000-\u001f\u007f]/u;

export const parsePublishingCallbackRequest = (
  value: unknown,
): PublishingCallbackRequest => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PublishingServiceHttpError(400, "invalid_request");
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const state = record["state"];

  if (
    typeof state !== "string" ||
    !OAUTH_STATE_PATTERN.test(state) ||
    keys.some((key) => key !== "state" && key !== "code" && key !== "denied")
  ) {
    throw new PublishingServiceHttpError(400, "invalid_request");
  }

  if (
    keys.length === 2 &&
    typeof record["code"] === "string" &&
    record["code"].length >= 1 &&
    record["code"].length <= 2_048 &&
    !OAUTH_CODE_CONTROL_PATTERN.test(record["code"])
  ) {
    return Object.freeze({ code: record["code"], state });
  }

  if (keys.length === 2 && record["denied"] === true) {
    return Object.freeze({ denied: true, state });
  }

  throw new PublishingServiceHttpError(400, "invalid_request");
};
