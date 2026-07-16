import { StripeSubscriptions } from "@convex-dev/stripe";
import { components } from "../_generated/api";
import { STRIPE_API_VERSION } from "../../lib/clipstitchr/billing/stripeApiVersion";

export function getStripeComponentClient() {
  return new StripeSubscriptions(components.stripe, {
    apiVersion: STRIPE_API_VERSION,
  });
}
