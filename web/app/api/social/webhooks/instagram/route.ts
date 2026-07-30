import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createSocialSecretHash } from "@/lib/clipstitchr/server/social/createSocialSecretHash";
import { readSocialRequestBody } from "@/lib/clipstitchr/server/social/readSocialRequestBody";
import { verifyInstagramWebhookSignature } from "@/lib/clipstitchr/server/social/verifyInstagramWebhookSignature";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN?.trim();

    if (
      !verifyToken ||
      url.searchParams.get("hub.mode") !== "subscribe" ||
      url.searchParams.get("hub.verify_token") !== verifyToken
    ) {
      return new Response("Invalid verification.", { status: 403 });
    }

    return new Response(url.searchParams.get("hub.challenge") || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    return new Response("Not found.", { status: 404 });
  }
}

export async function POST(request: Request) {
  try {
    assertInHouseSocialPublishingEnabled();

    const body = await readSocialRequestBody(request);

    if (
      !verifyInstagramWebhookSignature(
        body,
        request.headers.get("X-Hub-Signature-256"),
      )
    ) {
      return Response.json({ error: "Invalid signature." }, { status: 401 });
    }

    const payload = JSON.parse(body) as {
      entry?: Array<{
        id?: string;
        time?: number;
        changes?: Array<{ field?: string }>;
      }>;
      object?: string;
    };
    const firstEntry = payload.entry?.[0];
    const eventType =
      firstEntry?.changes
        ?.map((change) => change.field)
        .filter(Boolean)
        .join(",") ||
      payload.object ||
      "unknown";
    const payloadHash = createSocialSecretHash(body);
    const externalEventId = [
      firstEntry?.id ?? "",
      firstEntry?.time ?? "",
      payloadHash.slice(0, 16),
    ].join(":");
    const now = new Date().toISOString();
    const secret = getRateLimitApiSecret();
    const convex = createConvexHttpClient();

    await convex.mutation(api.rateLimits.consumeSocialWebhook, {
      platform: "instagram",
      secret,
    });

    const id = `social-webhook:instagram:${randomUUID()}`;
    const recorded = await convex.mutation(
      api.socialWebhooks.recordSocialWebhookEvent.recordSocialWebhookEvent,
      {
        secret,
        platform: "instagram",
        id,
        externalEventId,
        eventType,
        externalAccountId: firstEntry?.id,
        payloadHash,
        now,
      },
    );

    if (recorded.duplicate && recorded.disposition === "processed") {
      return Response.json({ received: true });
    }

    await convex.mutation(
      api.socialWebhooks.finishSocialWebhookEvent.finishSocialWebhookEvent,
      {
        secret,
        id: recorded.id,
        disposition: "processed",
        now: new Date().toISOString(),
      },
    );

    return Response.json({ received: true });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      { error: "Unable to process this Instagram update." },
      { status: 500 },
    );
  }
}
