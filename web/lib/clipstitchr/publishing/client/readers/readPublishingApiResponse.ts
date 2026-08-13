import type { ZodType } from "zod";
import { PublishingApiError } from "@/lib/clipstitchr/publishing/client/PublishingApiError";

const MAX_PUBLISHING_RESPONSE_CHARACTERS = 1_048_576;

export async function readPublishingApiResponse<Value>(
  response: Response,
  schema: ZodType<Value>,
): Promise<Value> {
  const text = await response.text();

  if (text.length > MAX_PUBLISHING_RESPONSE_CHARACTERS) {
    throw new PublishingApiError({
      code: "response_too_large",
      message: "Publishing returned more data than this screen can safely read.",
      status: response.status,
    });
  }

  let body: unknown;
  try {
    body = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    throw new PublishingApiError({
      code: "invalid_response",
      message: "Publishing returned an unreadable response. Try again.",
      status: response.status,
    });
  }

  if (!response.ok) {
    const errorBody = body as {
      code?: unknown;
      message?: unknown;
      retryAfterSeconds?: unknown;
    } | null;
    const retryHeader = Number(response.headers.get("Retry-After"));
    const retryAfterSeconds =
      typeof errorBody?.retryAfterSeconds === "number" &&
      Number.isFinite(errorBody.retryAfterSeconds) &&
      errorBody.retryAfterSeconds >= 0
        ? errorBody.retryAfterSeconds
        : Number.isFinite(retryHeader) && retryHeader >= 0
          ? retryHeader
          : null;

    throw new PublishingApiError({
      code:
        typeof errorBody?.code === "string" && errorBody.code.length <= 128
          ? errorBody.code
          : "request_failed",
      message:
        typeof errorBody?.message === "string" &&
        errorBody.message.trim().length > 0 &&
        errorBody.message.length <= 4_096
          ? errorBody.message
          : response.status === 429
            ? "Publishing is busy. Wait a moment, then try again."
            : "Publishing could not finish that request. Try again.",
      retryAfterSeconds,
      status: response.status,
    });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new PublishingApiError({
      code: "invalid_response",
      message: "Publishing returned data this screen could not verify. Try again.",
      status: response.status,
    });
  }

  return result.data;
}
