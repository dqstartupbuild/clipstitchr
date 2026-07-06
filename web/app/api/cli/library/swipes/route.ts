import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

function getLimit(value: string | null) {
  const limit = Number(value);

  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : undefined;
}

export async function GET(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  const url = new URL(request.url);
  const convex = createConvexHttpClient();
  const swipes = await convex.query(api.cliLibrary.listCliSwipes.listCliSwipes, {
    limit: getLimit(url.searchParams.get("limit")),
    ownerId: session.ownerId,
    productId: url.searchParams.get("productId") ?? undefined,
    secret: getRateLimitApiSecret(),
  });

  return NextResponse.json({ swipes });
}
