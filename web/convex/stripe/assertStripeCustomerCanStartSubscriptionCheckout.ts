import type Stripe from "stripe";

const TERMINAL_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
  "canceled",
  "incomplete_expired",
]);

export async function assertStripeCustomerCanStartSubscriptionCheckout(
  stripe: Pick<Stripe, "subscriptions">,
  customerId: string,
) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 100,
    status: "all",
  });
  const conflictingSubscription = subscriptions.data.find(
    (subscription) => !TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status),
  );

  if (conflictingSubscription || subscriptions.has_more) {
    throw new Error(
      "A Stripe subscription already exists for this billing account. Use the billing portal or contact support.",
    );
  }
}
