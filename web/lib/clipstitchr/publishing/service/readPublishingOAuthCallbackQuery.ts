import type { PublishingOAuthCallbackQuery } from "@/lib/clipstitchr/publishing/service/PublishingOAuthCallbackQuery";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

const CALLBACK_KEYS = new Set([
  "code",
  "error",
  "error_description",
  "error_reason",
  "state",
]);
const OAUTH_STATE_PATTERN = /^[A-Za-z0-9_-]{43}$/u;

export function readPublishingOAuthCallbackQuery(
  request: Request,
): PublishingOAuthCallbackQuery {
  if (request.url.length > 4_096) {
    throw new PublishingProxyRequestError(400, "invalid_callback");
  }
  const searchParams = new URL(request.url).searchParams;
  if ([...searchParams.keys()].some((key) => !CALLBACK_KEYS.has(key))) {
    throw new PublishingProxyRequestError(400, "invalid_callback");
  }

  const states = searchParams.getAll("state");
  const codes = searchParams.getAll("code");
  const errors = searchParams.getAll("error");
  const errorDescriptions = searchParams.getAll("error_description");
  const errorReasons = searchParams.getAll("error_reason");
  const state = states[0];

  if (
    states.length !== 1 ||
    state === undefined ||
    !OAUTH_STATE_PATTERN.test(state) ||
    errorDescriptions.length > 1 ||
    errorReasons.length > 1
  ) {
    throw new PublishingProxyRequestError(400, "invalid_callback");
  }

  if (
    codes.length === 1 &&
    errors.length === 0 &&
    errorDescriptions.length === 0 &&
    errorReasons.length === 0 &&
    codes[0] !== undefined &&
    codes[0].length >= 1 &&
    codes[0].length <= 2_048 &&
    !/[\u0000-\u001f\u007f]/u.test(codes[0])
  ) {
    return Object.freeze({ code: codes[0], state });
  }

  if (codes.length === 0 && errors.length === 1) {
    return Object.freeze({ denied: true, state });
  }

  throw new PublishingProxyRequestError(400, "invalid_callback");
}
