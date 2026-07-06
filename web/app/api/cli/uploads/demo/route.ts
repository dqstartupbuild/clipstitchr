import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliPositiveNumber } from "@/lib/clipstitchr/server/cli/readCliPositiveNumber";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { getR2UploadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2UploadSignedUrl";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readCliJsonObject(request);
    const contentType = readCliRequiredString(
      body,
      "contentType",
      "content type",
    );
    const productId = readCliRequiredString(body, "productId", "product ID");
    const sizeBytes = readCliPositiveNumber(body, "sizeBytes", "file size");

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

    await convex.mutation(api.rateLimits.consumeCliR2Upload, {
      ownerId: session.ownerId,
      secret,
      sizeBytes,
    });

    const clipId = createId();
    const key = createR2ObjectKey({
      contentType,
      kind: "upload-source-video",
      recordId: clipId,
      userId: session.ownerId,
    });
    const signedUrl = await getR2UploadSignedUrl({ contentType, key });

    return NextResponse.json({
      clipId,
      expiresIn: signedUrl.expiresIn,
      product: {
        id: product.id,
        name: product.name,
      },
      sourceVideoObject: {
        contentType,
        key,
        size: sizeBytes,
      },
      uploadUrl: signedUrl.url,
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
            : "Unable to create a demo upload.",
      },
      { status: 400 },
    );
  }
}
