import type { TikTokEventsApiPayload } from "@/lib/clipstitchr/server/analytics/TikTokEventsApiPayload";
import { tiktokEventsApiEndpoint } from "@/lib/clipstitchr/server/analytics/tiktokEventsApiEndpoint";

type SendTikTokEventsApiPayloadOptions = {
  accessToken: string;
  payload: TikTokEventsApiPayload;
};

function getJsonBody(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function getTikTokErrorMessage(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return "TikTok Events API request failed.";
  }

  const body = responseBody as {
    code?: number | string;
    message?: string;
    request_id?: string;
  };

  return [
    "TikTok Events API request failed.",
    body.code ? `Code: ${body.code}.` : "",
    body.message ? `Message: ${body.message}.` : "",
    body.request_id ? `Request ID: ${body.request_id}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function sendTikTokEventsApiPayload({
  accessToken,
  payload,
}: SendTikTokEventsApiPayloadOptions) {
  const response = await fetch(tiktokEventsApiEndpoint, {
    method: "POST",
    headers: {
      "Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const bodyText = await response.text();
  const responseBody = getJsonBody(bodyText);
  const responseCode =
    responseBody && typeof responseBody === "object"
      ? (responseBody as { code?: number | string }).code
      : undefined;

  if (
    !response.ok ||
    (responseCode !== undefined && responseCode !== 0 && responseCode !== "0")
  ) {
    throw new Error(getTikTokErrorMessage(responseBody));
  }

  return responseBody;
}
