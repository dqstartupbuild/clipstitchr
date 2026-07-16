import type Stripe from "stripe";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { internal } from "../_generated/api";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";

export async function handleStripeWebhookEvent(
  ctx: GenericActionCtx<GenericDataModel>,
  event: Stripe.Event,
) {
  let eventToProcess = event;

  if (
    event.type === "charge.dispute.created" ||
    event.type === "charge.dispute.closed"
  ) {
    const dispute = event.data.object as Stripe.Dispute;

    if (typeof dispute.charge === "string") {
      const charge = await createStripeSdk().charges.retrieve(dispute.charge);
      eventToProcess = {
        ...event,
        data: { ...event.data, object: { ...dispute, charge } },
      } as Stripe.Event;
    }
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
