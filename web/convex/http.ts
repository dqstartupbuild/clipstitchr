import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { handleLoopsWebhookRequest } from "./email/handleLoopsWebhookRequest";

const http = httpRouter();

http.route({
  handler: httpAction(async (ctx, request) =>
    await handleLoopsWebhookRequest(ctx, request),
  ),
  method: "POST",
  path: "/webhooks/loops",
});

export default http;
