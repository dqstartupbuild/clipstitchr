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
import { readProductProfileInput } from "@/lib/clipstitchr/server/readProductProfileInput";

export const runtime = "nodejs";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: ProductRouteContext,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { id } = await params;
    const productId = id.trim();

    if (!productId) {
      throw new Error("Missing product ID.");
    }

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const existingProduct = await convex.query(api.products.get, {
      id: productId,
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 },
      );
    }

    const input = readProductProfileInput(await request.json());
    const rateLimitSecret = getRateLimitApiSecret();

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
      id: productId,
      ...input,
      ...enrichment,
      createdAt: existingProduct.createdAt,
      updatedAt: now,
    };

    await convex.mutation(api.products.update, {
      id: product.id,
      name: product.name,
      productDetails: product.productDetails,
      audienceDetails: product.audienceDetails,
      inferredProblem: product.inferredProblem,
      inferredPainPoints: product.inferredPainPoints,
      eligibleCliprHookStyleKeys: product.eligibleCliprHookStyleKeys,
      eligibleCliprHookTemplateIds: product.eligibleCliprHookTemplateIds,
      cliprPlaceholderFillers: product.cliprPlaceholderFillers,
      preferredCliprHookStyleKey: product.preferredCliprHookStyleKey,
      updatedAt: product.updatedAt,
    });

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
            : "Unable to update this product.",
      },
      { status: 500 },
    );
  }
}
