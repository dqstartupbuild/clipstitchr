import type Stripe from "stripe";
import { getPlanKeyForStripePrice } from "../../lib/clipstitchr/billing/getPlanKeyForStripePrice";
import { isPlanKey } from "../../lib/clipstitchr/billing/isPlanKey";
import { getStripeResourceId } from "./getStripeResourceId";
import { toStripeIsoString } from "./toStripeIsoString";

export function getStripeSubscriptionSnapshot(
  subscription: Stripe.Subscription,
) {
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const pricePlanKey = priceId ? getPlanKeyForStripePrice(priceId) : undefined;
  const planKey =
    pricePlanKey ??
    (isPlanKey(subscription.metadata.planKey)
      ? subscription.metadata.planKey
      : undefined);
  const ownerId = subscription.metadata.ownerId?.trim();
  const customerId = getStripeResourceId(subscription.customer);

  if (
    !item ||
    !priceId ||
    !planKey ||
    !customerId ||
    !item.current_period_start ||
    !item.current_period_end
  ) {
    throw new Error("Stripe subscription is missing ClipStitchr billing data.");
  }

  return {
    cancelAtPeriodEnd: Boolean(
      subscription.cancel_at_period_end || subscription.cancel_at,
    ),
    customerId,
    ownerId: ownerId || undefined,
    periodEnd: toStripeIsoString(item.current_period_end),
    periodStart: toStripeIsoString(item.current_period_start),
    planKey,
    priceId,
    status: subscription.status,
    subscriptionId: subscription.id,
  };
}
