import { httpRouter } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import { components } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { handleLoopsWebhookRequest } from "./email/handleLoopsWebhookRequest";
import { handleStripeWebhookEvent } from "./stripe/handleStripeWebhookEvent";
import { STRIPE_API_VERSION } from "../lib/clipstitchr/billing/stripeApiVersion";
import { handleClerkWebhookRequest } from "./accountEmail/handleClerkWebhookRequest";

const http = httpRouter();

http.route({
  handler: httpAction(async (ctx, request) =>
    await handleLoopsWebhookRequest(ctx, request),
  ),
  method: "POST",
  path: "/webhooks/loops",
});

http.route({
  handler: httpAction(async (ctx, request) =>
    await handleClerkWebhookRequest(ctx, request),
  ),
  method: "POST",
  path: "/webhooks/clerk",
});

registerRoutes(http, components.stripe, {
  apiVersion: STRIPE_API_VERSION,
  onEvent: handleStripeWebhookEvent,
  webhookPath: "/stripe/webhook",
});

export default http;
