import { STRIPE_GRACE_PERIOD_MS } from "../../lib/clipstitchr/billing/stripeGracePeriodMs";

export function getStripeGraceEndsAt(
  existingGraceEndsAt: string | undefined,
  eventCreatedAt: number,
) {
  return (
    existingGraceEndsAt ??
    new Date(eventCreatedAt * 1_000 + STRIPE_GRACE_PERIOD_MS).toISOString()
  );
}
