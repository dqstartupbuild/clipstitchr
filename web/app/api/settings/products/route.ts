import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createProductEnrichment } from "@/lib/clipstitchr/server/createProductEnrichment";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

type ProductCreateRequestBody = {
  audienceDetails?: unknown;
  name?: unknown;
  productDetails?: unknown;
};

function readProductCreateInput(
  body: ProductCreateRequestBody,
): ProductProfileCreateInput {
  const input = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    productDetails:
      typeof body.productDetails === "string" ? body.productDetails.trim() : "",
    audienceDetails:
      typeof body.audienceDetails === "string"
        ? body.audienceDetails.trim()
        : "",
  };

  if (!input.name) {
    throw new Error("Product name is required.");
  }

  return input;
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const rateLimitSecret = getRateLimitApiSecret();
    const input = readProductCreateInput(
      (await request.json()) as ProductCreateRequestBody,
    );

    await convex.mutation(api.rateLimits.consumeProductEnrichment, {
      secret: rateLimitSecret,
    });

    const replicate = createReplicateClient();
    const enrichment = await createProductEnrichment({
      product: input,
      replicate,
    });
    const now = new Date().toISOString();
    const product = {
      id: createId(),
      ...input,
      ...enrichment,
      createdAt: now,
      updatedAt: now,
    };

    await convex.mutation(api.products.create, product);

    return NextResponse.json({ product });
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
            : "Unable to save this product.",
      },
      { status: 500 },
    );
  }
}
