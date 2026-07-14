import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { parseLoopsWebhookEvent } from "../../lib/clipstitchr/email/webhooks/parseLoopsWebhookEvent";
import { readBoundedWebhookBody } from "../../lib/clipstitchr/email/webhooks/readBoundedWebhookBody";
import { verifyLoopsWebhookSignature } from "../../lib/clipstitchr/email/webhooks/verifyLoopsWebhookSignature";

type LoopsWebhookRequestOptions = Readonly<{
  now?: number;
  signingSecret?: string;
}>;

const responseHeaders = { "Cache-Control": "private, no-store" };

export async function handleLoopsWebhookRequest(
  ctx: ActionCtx,
  request: Request,
  options: LoopsWebhookRequestOptions = {},
) {
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 415 },
    );
  }

  const webhookId = request.headers.get("webhook-id") ?? "";
  const timestamp = request.headers.get("webhook-timestamp") ?? "";
  const signatureHeader = request.headers.get("webhook-signature") ?? "";
  const signingSecret =
    options.signingSecret ?? process.env.LOOPS_SIGNING_SECRET?.trim();
  const now = options.now ?? Date.now();

  if (
    !webhookId ||
    webhookId.length > 256 ||
    !timestamp ||
    !signatureHeader
  ) {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 400 },
    );
  }

  if (!signingSecret) {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 503 },
    );
  }

  let rawBody: string;

  try {
    rawBody = await readBoundedWebhookBody(request);
  } catch (error) {
    return Response.json(
      { accepted: false },
      {
        headers: responseHeaders,
        status:
          error instanceof Error && error.message === "Webhook body is too large."
            ? 413
            : 400,
      },
    );
  }

  const signatureIsValid = await verifyLoopsWebhookSignature({
    eventId: webhookId,
    nowSeconds: Math.floor(now / 1_000),
    rawBody,
    signatureHeader,
    signingSecret,
    timestamp,
  });

  if (!signatureIsValid) {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 401 },
    );
  }

  let event;

  try {
    event = parseLoopsWebhookEvent(rawBody);
  } catch {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 400 },
    );
  }

  try {
    await ctx.runMutation(
      internal.email.reconcileLoopsWebhookEvent.reconcileLoopsWebhookEvent,
      { ...event, receivedAt: now, webhookId },
    );
  } catch {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 500 },
    );
  }

  return Response.json(
    { accepted: true },
    { headers: responseHeaders, status: 200 },
  );
}
