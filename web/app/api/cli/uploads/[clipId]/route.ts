import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

type CliUploadStatusRouteContext = {
  params: Promise<{ clipId: string }>;
};

export async function GET(
  request: Request,
  { params }: CliUploadStatusRouteContext,
) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  const { clipId } = await params;
  const convex = createConvexHttpClient();
  const status = await convex.query(
    api.cliUploads.getCliUploadStatus.getCliUploadStatus,
    {
      clipId,
      ownerId: session.ownerId,
      secret: getRateLimitApiSecret(),
    },
  );

  return NextResponse.json(status);
}
