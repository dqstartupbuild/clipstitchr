import { api } from "@/convex/_generated/api";
import { createTikTokEventsApiPayload } from "@/lib/clipstitchr/server/analytics/createTikTokEventsApiPayload";
import { createTikTokEventsApiRateLimitKey } from "@/lib/clipstitchr/server/analytics/createTikTokEventsApiRateLimitKey";
import { getHasMarketingConsentFromCookieHeader } from "@/lib/clipstitchr/server/analytics/getHasMarketingConsentFromCookieHeader";
import { getTikTokEventsApiAccessToken } from "@/lib/clipstitchr/server/analytics/getTikTokEventsApiAccessToken";
import { getTikTokEventsApiPixelId } from "@/lib/clipstitchr/server/analytics/getTikTokEventsApiPixelId";
import { getTikTokEventsApiTestEventCode } from "@/lib/clipstitchr/server/analytics/getTikTokEventsApiTestEventCode";
import { readTikTokEventsApiRequest } from "@/lib/clipstitchr/server/analytics/readTikTokEventsApiRequest";
import { sendTikTokEventsApiPayload } from "@/lib/clipstitchr/server/analytics/sendTikTokEventsApiPayload";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

const maxBodyBytes = 32 * 1024;

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!getHasMarketingConsentFromCookieHeader(cookieHeader)) {
    return Response.json({ skipped: "marketing_consent_required" });
  }

  const accessToken = getTikTokEventsApiAccessToken();

  if (!accessToken) {
    return Response.json({ skipped: "missing_tiktok_events_api_access_token" });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxBodyBytes) {
    return Response.json(
      { error: "TikTok Events API request is too large." },
      { status: 413 },
    );
  }

  try {
    const clientRequest = await readTikTokEventsApiRequest(request);
    const convex = createConvexHttpClient();

    await convex.mutation(api.rateLimits.consumeTikTokEventsApi, {
      key: createTikTokEventsApiRateLimitKey(request),
      secret: getRateLimitApiSecret(),
    });

    const payload = createTikTokEventsApiPayload({
      clientRequest,
      cookieHeader,
      pixelId: getTikTokEventsApiPixelId(),
      request,
      testEventCode: getTikTokEventsApiTestEventCode(),
    });
    const result = await sendTikTokEventsApiPayload({
      accessToken,
      payload,
    });

    return Response.json({
      ok: true,
      result,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send TikTok Events API event.",
      },
      { status: 400 },
    );
  }
}
