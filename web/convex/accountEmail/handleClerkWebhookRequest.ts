import { verifyWebhook } from "@clerk/backend/webhooks";
import type { UserJSON } from "@clerk/backend";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { ClerkAccountContactInput } from "./ClerkAccountContactInput";
import { getClerkAccountNames } from "./getClerkAccountNames";
import { getClerkOwnerId } from "./getClerkOwnerId";
import { getClerkWebhookEventAt } from "./getClerkWebhookEventAt";
import { getVerifiedPrimaryClerkEmail } from "./getVerifiedPrimaryClerkEmail";
import { isSupportedClerkUserEventType } from "./isSupportedClerkUserEventType";
import { readBoundedClerkWebhookBody } from "./readBoundedClerkWebhookBody";

type ClerkWebhookRequestOptions = Readonly<{
  now?: number;
  signingSecret?: string;
}>;

const responseHeaders = { "Cache-Control": "private, no-store" };

export async function handleClerkWebhookRequest(
  ctx: ActionCtx,
  request: Request,
  options: ClerkWebhookRequestOptions = {},
) {
  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 415 },
    );
  }

  const webhookId = request.headers.get("svix-id")?.trim() ?? "";
  const timestampHeader = request.headers.get("svix-timestamp")?.trim() ?? "";
  const signatureHeader = request.headers.get("svix-signature")?.trim() ?? "";
  const eventAt = getClerkWebhookEventAt(timestampHeader);

  if (
    !webhookId ||
    webhookId.length > 256 ||
    !signatureHeader ||
    eventAt === null
  ) {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 400 },
    );
  }

  const signingSecret =
    options.signingSecret ??
    process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();

  if (!signingSecret) {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 503 },
    );
  }

  try {
    await readBoundedClerkWebhookBody(request.clone());
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

  let event;

  try {
    event = await verifyWebhook(request.clone(), { signingSecret });
  } catch {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 401 },
    );
  }

  if (!isSupportedClerkUserEventType(event.type)) {
    return Response.json(
      { accepted: true, status: "ignored", welcomeEligible: false },
      { headers: responseHeaders, status: 200 },
    );
  }

  const ownerId = getClerkOwnerId(event.data.id);
  let contact: ClerkAccountContactInput | undefined;

  if (event.type !== "user.deleted") {
    const user = event.data as UserJSON;
    const verifiedPrimaryEmail = getVerifiedPrimaryClerkEmail(user);

    if (verifiedPrimaryEmail) {
      contact = {
        ...verifiedPrimaryEmail,
        ...getClerkAccountNames(user),
      };
    }
  }

  try {
    const result = await ctx.runMutation(
      internal.accountEmail.reconcileClerkUserEvent.reconcileClerkUserEvent,
      {
        contact,
        eventAt,
        eventType: event.type,
        ownerId,
        processedAt: options.now ?? Date.now(),
        webhookId,
      },
    );

    return Response.json(
      { accepted: true, ...result },
      { headers: responseHeaders, status: 200 },
    );
  } catch {
    return Response.json(
      { accepted: false },
      { headers: responseHeaders, status: 500 },
    );
  }
}
