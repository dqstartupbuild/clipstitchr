import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createSocialSecretHash } from "@/lib/clipstitchr/server/social/createSocialSecretHash";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const secret = getRateLimitApiSecret();
    const convex = createConvexHttpClient();
    const grant = await convex.query(
      api.socialMedia.getSocialMediaAccessGrant.getSocialMediaAccessGrant,
      {
        secret,
        tokenHash: createSocialSecretHash(token),
        now: new Date().toISOString(),
      },
    );

    if (!grant) {
      return Response.json(
        { error: "This social media link is no longer available." },
        {
          status: 404,
          headers: {
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        },
      );
    }

    await convex.mutation(api.rateLimits.consumeSocialMediaFetch, {
      ownerId: grant.ownerId,
      secret,
    });

    const signed = await getR2DownloadSignedUrl(grant.objectKey);

    return Response.redirect(signed.url, 302);
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      { error: "Unable to open this social media file." },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }
}
