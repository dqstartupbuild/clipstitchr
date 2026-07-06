import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { createCliTokenHash } from "@/lib/clipstitchr/server/cli/createCliTokenHash";
import { readCliBearerToken } from "@/lib/clipstitchr/server/cli/readCliBearerToken";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = readCliBearerToken(request);

  if (!token) {
    return createCliAuthenticationRequiredResponse();
  }

  const convex = createConvexHttpClient();
  const result = await convex.mutation(
    api.cliAuth.revokeSessionByTokenHash.revokeSessionByTokenHash,
    {
      revokedAt: new Date().toISOString(),
      secret: getRateLimitApiSecret(),
      tokenHash: createCliTokenHash(token),
    },
  );

  return NextResponse.json(result);
}
