import "server-only";

import { randomUUID } from "node:crypto";

import type { PublishingServiceRequestInput } from "@/lib/clipstitchr/publishing/service/PublishingServiceRequestInput";
import type { PublishingServiceResponse } from "@/lib/clipstitchr/publishing/service/PublishingServiceResponse";
import { PublishingServiceResponseError } from "@/lib/clipstitchr/publishing/service/PublishingServiceResponseError";
import { issueAuthenticatedPublishingServiceAssertion } from "@/lib/clipstitchr/publishing/service/issueAuthenticatedPublishingServiceAssertion";
import { parsePublishingRetryAfterSeconds } from "@/lib/clipstitchr/publishing/service/parsePublishingRetryAfterSeconds";
import { readBoundedPublishingServiceResponse } from "@/lib/clipstitchr/publishing/service/readBoundedPublishingServiceResponse";
import { readPublishingServiceOrigin } from "@/lib/clipstitchr/publishing/service/readPublishingServiceOrigin";

const SERVICE_PATH_PATTERN = /^\/v1(?:\/[A-Za-z0-9._~-]+)+$/;
const MAX_SERVICE_REQUEST_BYTES = 262_144;

export async function requestPublishingService(
  input: PublishingServiceRequestInput,
): Promise<PublishingServiceResponse> {
  if (!SERVICE_PATH_PATTERN.test(input.path) || input.path.length > 512) {
    throw new Error("Publishing service path is invalid.");
  }

  const origin = readPublishingServiceOrigin();
  const url = new URL(input.path, origin);

  if (input.searchParams) {
    for (const [name, value] of Object.entries(input.searchParams)) {
      if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(name) || value.length > 512) {
        throw new Error("Publishing service query is invalid.");
      }
      url.searchParams.set(name, value);
    }
  }

  const requestId = randomUUID();
  const assertion = await issueAuthenticatedPublishingServiceAssertion({
    action: input.action,
    requestId,
  });
  const encodedBody =
    input.body === undefined ? undefined : JSON.stringify(input.body);

  if (
    encodedBody !== undefined &&
    Buffer.byteLength(encodedBody, "utf8") > MAX_SERVICE_REQUEST_BYTES
  ) {
    throw new Error("Publishing service request is too large.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;

  try {
    response = await fetch(url, {
      method: input.method,
      headers: {
        Authorization: `Bearer ${assertion}`,
        "X-ClipStitchr-Request-Id": requestId,
        ...(encodedBody === undefined
          ? {}
          : { "Content-Type": "application/json; charset=utf-8" }),
      },
      ...(encodedBody === undefined ? {} : { body: encodedBody }),
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
  } catch {
    throw new PublishingServiceResponseError(503);
  } finally {
    clearTimeout(timeout);
  }

  const retryAfterSeconds = parsePublishingRetryAfterSeconds(
    response.headers.get("retry-after"),
  );
  let body: unknown;

  try {
    body = await readBoundedPublishingServiceResponse(response);
  } catch {
    if (response.ok) {
      throw new PublishingServiceResponseError(502);
    }
    body = null;
  }

  if (!response.ok) {
    throw new PublishingServiceResponseError(
      response.status,
      retryAfterSeconds,
    );
  }

  return Object.freeze({ body, retryAfterSeconds, status: response.status });
}
