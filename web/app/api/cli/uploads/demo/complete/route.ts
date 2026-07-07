import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliDemoWalkthroughMetadata } from "@/lib/clipstitchr/server/cli/demoWalkthrough/readCliDemoWalkthroughMetadata";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliPositiveNumber } from "@/lib/clipstitchr/server/cli/readCliPositiveNumber";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readCliJsonObject(request);
    const clipId = readCliRequiredString(body, "clipId", "clip ID");
    const contentType = readCliRequiredString(
      body,
      "contentType",
      "content type",
    );
    const key = readCliRequiredString(body, "key", "R2 object key");
    const originalName = readCliRequiredString(
      body,
      "originalName",
      "original file name",
    );
    const layout =
      body.layout === "crop-fill" ||
      body.layout === "fit-with-background" ||
      body.layout === "smart-screen-demo"
        ? body.layout
        : undefined;
    const interactionEvents = Array.isArray(body.interactionEvents)
      ? body.interactionEvents.slice(-5000)
      : undefined;
    const walkthrough = readCliDemoWalkthroughMetadata(body.walkthrough);
    const productId = readCliRequiredString(body, "productId", "product ID");
    const size = readCliPositiveNumber(body, "size", "file size");

    assertR2ObjectKeyBelongsToUser(key, session.ownerId);

    if (!contentType.startsWith("video/")) {
      throw new Error("Demo uploads must be video files.");
    }

    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();
    const product = await convex.query(
      api.cliProducts.getCliProduct.getCliProduct,
      {
        id: productId,
        ownerId: session.ownerId,
        secret,
      },
    );

    if (!product) {
      throw new Error("Product not found.");
    }

    await convex.mutation(api.rateLimits.consumeCliUploadVideoAnalysis, {
      ownerId: session.ownerId,
      secret,
    });

    const createdAt = new Date().toISOString();
    const job = await convex.mutation(api.mediaJobs.createUploadNormalization, {
      createdAt,
      id: `media:upload-normalization:${clipId}`,
      idempotencyKey: `${session.ownerId}:upload-normalization:${clipId}`,
      inputSnapshotJson: JSON.stringify({
        clipId,
        clipType: "demo",
        interactionEvents,
        layout,
        originalName,
        productId,
        sourceVideoObject: {
          contentType,
          key,
          size,
        },
        walkthrough,
      }),
      ownerId: session.ownerId,
      secret,
    });

    return NextResponse.json({
      job: {
        id: job.id,
        stage: job.stage,
        status: job.status,
      },
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to finish this demo upload.",
      },
      { status: 400 },
    );
  }
}
