import type Stripe from "stripe";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { internal } from "../_generated/api";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";
import { attachStripeChargeRecoveryContext } from "./attachStripeChargeRecoveryContext";
import { refreshStripeSubscriptionEvent } from "./refreshStripeSubscriptionEvent";

export async function handleStripeWebhookEvent(
  ctx: GenericActionCtx<GenericDataModel>,
  event: Stripe.Event,
) {
  let eventToProcess = event;

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    eventToProcess = await refreshStripeSubscriptionEvent(
      createStripeSdk(),
      event,
    );
  } else if (event.type === "charge.refunded") {
    const charge = await attachStripeChargeRecoveryContext(
      createStripeSdk(),
      event.data.object as Stripe.Charge,
    );
    eventToProcess = {
      ...event,
      data: { ...event.data, object: charge },
    } as Stripe.Event;
  } else if (
    event.type === "charge.dispute.created" ||
    event.type === "charge.dispute.closed"
  ) {
    const dispute = event.data.object as Stripe.Dispute;
    const stripe = createStripeSdk();
    const unlinkedCharge =
      typeof dispute.charge === "string"
        ? await stripe.charges.retrieve(dispute.charge)
        : dispute.charge;
    const charge = await attachStripeChargeRecoveryContext(
      stripe,
      unlinkedCharge,
    );
    eventToProcess = {
      ...event,
      data: { ...event.data, object: { ...dispute, charge } },
    } as Stripe.Event;
  } else if (event.type === "refund.failed") {
    const refund = event.data.object as Stripe.Refund;
    const stripe = createStripeSdk();
    const unlinkedCharge =
      typeof refund.charge === "string"
        ? await stripe.charges.retrieve(refund.charge)
        : refund.charge;

    if (!unlinkedCharge) {
      throw new Error("Stripe failed refund is missing its charge.");
    }

    const charge = await attachStripeChargeRecoveryContext(
      stripe,
      unlinkedCharge,
    );
    eventToProcess = {
      ...event,
      data: { ...event.data, object: { ...refund, charge } },
    } as Stripe.Event;
  }

  try {
    await ctx.runMutation(
      internal.stripe.processStripeEvent.processStripeEvent,
      { eventJson: JSON.stringify(eventToProcess) },
    );
  } catch (error) {
    const object = event.data.object as { id?: string };
    await ctx.runMutation(
      internal.stripe.recordStripeEventFailure.recordStripeEventFailure,
      {
        error: error instanceof Error ? error.message : String(error),
        eventCreatedAt: event.created,
        eventId: event.id,
        eventType: event.type,
        livemode: event.livemode,
        now: new Date().toISOString(),
        objectId: object.id,
      },
    );
    throw error;
  }
}
