import { api } from "@/convex/_generated/api";
import type { VerifiedEmailConfirmationReference } from "@/lib/clipstitchr/email/confirmation/VerifiedEmailConfirmationReference";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function confirmEmailConsentWithConvex({
  clientKey,
  confirmedAt,
  reference,
}: {
  clientKey: string;
  confirmedAt: number;
  reference: VerifiedEmailConfirmationReference;
}) {
  return createConvexHttpClient().mutation(
    api.email.confirmEmailConsent.confirmEmailConsent,
    {
      ...reference,
      clientKey,
      confirmedAt,
      secret: getRateLimitApiSecret(),
    },
  );
}
