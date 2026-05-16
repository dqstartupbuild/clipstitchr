import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createIndexNowPayload } from "@/lib/clipstitchr/server/indexnow/createIndexNowPayload";
import { createIndexNowRateLimitKey } from "@/lib/clipstitchr/server/indexnow/createIndexNowRateLimitKey";
import { getIndexNowPublicSiteUrl } from "@/lib/clipstitchr/server/indexnow/getIndexNowPublicSiteUrl";
import { getIndexNowSubmissionUrls } from "@/lib/clipstitchr/server/indexnow/getIndexNowSubmissionUrls";
import { getIsAuthorizedIndexNowRequest } from "@/lib/clipstitchr/server/indexnow/getIsAuthorizedIndexNowRequest";
import { submitIndexNowPayload } from "@/lib/clipstitchr/server/indexnow/submitIndexNowPayload";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!getIsAuthorizedIndexNowRequest(request)) {
      return NextResponse.json(
        { message: "Unauthorized IndexNow submission request." },
        { status: 401 },
      );
    }

    const siteUrl = getIndexNowPublicSiteUrl();
    const urls = getIndexNowSubmissionUrls(siteUrl);
    const payload = createIndexNowPayload({ siteUrl, urls });
    const convex = createConvexHttpClient();

    await convex.mutation(api.rateLimits.consumeIndexNowSubmit, {
      key: createIndexNowRateLimitKey(request),
      secret: getRateLimitApiSecret(),
      urlCount: payload.urlList.length,
    });

    const result = await submitIndexNowPayload(payload);

    if (!result.ok) {
      return NextResponse.json(
        {
          message: "IndexNow rejected the URL submission.",
          providerBody: result.body,
          providerStatus: result.status,
          providerStatusText: result.statusText,
          submittedUrlCount: payload.urlList.length,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      providerStatus: result.status,
      providerStatusText: result.statusText,
      submittedUrlCount: payload.urlList.length,
      urls: payload.urlList,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit URLs to IndexNow.",
      },
      { status: 500 },
    );
  }
}
