import { getStripeMode } from "../../lib/clipstitchr/billing/getStripeMode";

export function assertStripeEventMode(livemode: boolean) {
  const expectedLivemode = getStripeMode() === "live";

  if (livemode !== expectedLivemode) {
    throw new Error("Stripe webhook event mode does not match this deployment.");
  }
}
