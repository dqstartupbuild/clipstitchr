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
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

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
    const input = readProductProfileInput(await request.json());

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
