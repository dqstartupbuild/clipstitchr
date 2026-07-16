import type Stripe from "stripe";

export async function refreshStripeSubscriptionEvent(
  stripe: Pick<Stripe, "subscriptions">,
  event: Stripe.Event,
) {
  if (
    event.type !== "customer.subscription.created" &&
    event.type !== "customer.subscription.updated"
  ) {
    return event;
  }

  const snapshot = event.data.object as Stripe.Subscription;
  const subscription = await stripe.subscriptions.retrieve(snapshot.id);

  return {
    ...event,
    data: { ...event.data, object: subscription },
  } as Stripe.Event;
}
