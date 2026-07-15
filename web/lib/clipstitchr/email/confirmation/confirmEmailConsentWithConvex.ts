import { api } from "@/convex/_generated/api";
import type { VerifiedEmailConfirmationReference } from "@/lib/clipstitchr/email/confirmation/VerifiedEmailConfirmationReference";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function confirmEmailConsentWithConvex({
  clientKey,
  confirmedAt,
  courseSessionExpiresAt,
  courseSessionTokenHash,
  reference,
}: {
  clientKey: string;
  confirmedAt: number;
  courseSessionExpiresAt: number;
  courseSessionTokenHash: string;
  reference: VerifiedEmailConfirmationReference;
}) {
  return createConvexHttpClient().mutation(
    api.email.confirmEmailConsent.confirmEmailConsent,
    {
      ...reference,
      clientKey,
      confirmedAt,
      courseSessionExpiresAt,
      courseSessionTokenHash,
      secret: getRateLimitApiSecret(),
    },
  );
}
