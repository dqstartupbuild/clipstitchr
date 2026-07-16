import type Stripe from "stripe";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";

export async function createStripeSubscriptionCheckoutSession(
  stripe: Pick<Stripe, "checkout">,
  args: {
    cancelUrl: string;
    checkoutIntentId: string;
    customerId: string;
    ownerId: string;
    planKey: PlanKey;
    priceId: string;
    successUrl: string;
  },
) {
  return await stripe.checkout.sessions.create(
    {
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      cancel_url: args.cancelUrl,
      client_reference_id: args.ownerId,
      consent_collection: {
        terms_of_service: "required",
      },
      customer: args.customerId,
      line_items: [{ price: args.priceId, quantity: 1 }],
      metadata: {
        catalogKey: args.planKey,
        checkoutIntentId: args.checkoutIntentId,
        operation: "subscription_checkout",
        ownerId: args.ownerId,
      },
      mode: "subscription",
      subscription_data: {
        metadata: {
          catalogKey: args.planKey,
          checkoutIntentId: args.checkoutIntentId,
          ownerId: args.ownerId,
          planKey: args.planKey,
        },
      },
      success_url: args.successUrl,
    },
    {
      idempotencyKey: `clipstitchr_subscription_checkout_${args.checkoutIntentId}`,
    },
  );
}
