import { getHasAnalyticsConsentFromCookieHeader } from "@/lib/clipstitchr/server/analytics/getHasAnalyticsConsentFromCookieHeader";
import { getPostHogClient } from "@/lib/posthog-server";

type CapturePostHogServerEventOptions = {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
  request: Request;
};

export async function capturePostHogServerEvent({
  distinctId,
  event,
  properties,
  request,
}: CapturePostHogServerEventOptions) {
  if (
    !getHasAnalyticsConsentFromCookieHeader(request.headers.get("cookie"))
  ) {
    return;
  }

  const posthog = getPostHogClient();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId,
      event,
      properties,
    });
    await posthog.shutdown();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("PostHog server capture failed.", error);
    }
  }
}
