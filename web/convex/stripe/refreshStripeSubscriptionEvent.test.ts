import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { refreshStripeSubscriptionEvent } from "./refreshStripeSubscriptionEvent";

describe("refreshStripeSubscriptionEvent", () => {
  it("gives same-second plan and cancellation events the current Stripe state", async () => {
    const currentSubscription = {
      cancel_at_period_end: true,
      id: "sub_1",
      items: { data: [{ price: { id: "price_pro" } }] },
      status: "active",
    } as unknown as Stripe.Subscription;
    const retrieve = vi.fn(async () => currentSubscription);
    const stripe = { subscriptions: { retrieve } };
    const planEvent = {
      created: 200,
      data: { object: { id: "sub_1", cancel_at_period_end: false } },
      id: "evt_plan",
      type: "customer.subscription.updated",
    } as Stripe.Event;
    const cancelEvent = {
      created: 200,
      data: { object: { id: "sub_1", cancel_at_period_end: true } },
      id: "evt_cancel",
      type: "customer.subscription.updated",
    } as Stripe.Event;

    const [refreshedPlan, refreshedCancel] = await Promise.all([
      refreshStripeSubscriptionEvent(stripe as never, planEvent),
      refreshStripeSubscriptionEvent(stripe as never, cancelEvent),
    ]);

    expect(refreshedPlan.data.object).toBe(currentSubscription);
    expect(refreshedCancel.data.object).toBe(currentSubscription);
    expect(retrieve).toHaveBeenCalledTimes(2);
  });

  it("keeps deletion payloads authoritative to the deletion event", async () => {
    const retrieve = vi.fn();
    const event = {
      data: { object: { id: "sub_1", status: "canceled" } },
      type: "customer.subscription.deleted",
    } as Stripe.Event;

    await expect(
      refreshStripeSubscriptionEvent(
        { subscriptions: { retrieve } } as never,
        event,
      ),
    ).resolves.toBe(event);
    expect(retrieve).not.toHaveBeenCalled();
  });
});
