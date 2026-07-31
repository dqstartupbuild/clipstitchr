import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const status = await createConvexHttpClient().query(
    api.socialDataDeletion.getSocialDataDeletionStatus
      .getSocialDataDeletionStatus,
    {
      secret: getRateLimitApiSecret(),
      confirmationCode: code,
    },
  );

  if (!status) {
    return Response.json({ error: "Deletion request not found." }, { status: 404 });
  }

  return Response.json(status, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
