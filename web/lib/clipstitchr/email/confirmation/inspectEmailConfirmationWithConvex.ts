import { api } from "@/convex/_generated/api";
import type { VerifiedEmailConfirmationReference } from "@/lib/clipstitchr/email/confirmation/VerifiedEmailConfirmationReference";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function inspectEmailConfirmationWithConvex(
  reference: VerifiedEmailConfirmationReference,
  inspectedAt: number,
) {
  return createConvexHttpClient().query(
    api.email.inspectEmailConfirmationToken.inspectEmailConfirmationToken,
    {
      ...reference,
      inspectedAt,
      secret: getRateLimitApiSecret(),
    },
  );
}
