import Stripe from "stripe";
import { assertStripeSecretKeyMode } from "./assertStripeSecretKeyMode";
import { getRequiredBillingEnvironmentValue } from "./getRequiredBillingEnvironmentValue";
import { getStripeMode } from "./getStripeMode";
import { STRIPE_API_VERSION } from "./stripeApiVersion";

export function createStripeSdk() {
  const secretKey = getRequiredBillingEnvironmentValue("STRIPE_SECRET_KEY");

  assertStripeSecretKeyMode(secretKey, getStripeMode());

  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
