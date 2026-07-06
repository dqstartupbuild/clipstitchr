import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { CliAuthenticatedSession } from "./CliAuthenticatedSession";
import { createCliTokenHash } from "./createCliTokenHash";
import { readCliBearerToken } from "./readCliBearerToken";

export async function getCliSessionFromRequest(
  request: Request,
): Promise<CliAuthenticatedSession | null> {
  const token = readCliBearerToken(request);

  if (!token) {
    return null;
  }

  const convex = createConvexHttpClient();

  return await convex.query(
    api.cliAuth.getActiveSessionByTokenHash.getActiveSessionByTokenHash,
    {
      checkedAt: new Date().toISOString(),
      secret: getRateLimitApiSecret(),
      tokenHash: createCliTokenHash(token),
    },
  );
}
