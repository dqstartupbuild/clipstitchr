import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createProductEnrichment } from "@/lib/clipstitchr/server/createProductEnrichment";
import { createProductProfileInputWithWebsiteDetails } from "@/lib/clipstitchr/server/createProductProfileInputWithWebsiteDetails";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createResolvedProductEnrichmentFields } from "@/lib/clipstitchr/server/createResolvedProductEnrichmentFields";
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

    const productInput = await createProductProfileInputWithWebsiteDetails({
      product: input,
      shouldScrapeWebsite: Boolean(input.websiteUrl),
    });
    const replicate = createReplicateClient();
    const enrichment = await createProductEnrichment({
      product: productInput,
      replicate,
    });
    const resolvedFields = createResolvedProductEnrichmentFields({
      enrichment,
      input,
    });
    const now = new Date().toISOString();
    const product = {
      id: createId(),
      ...input,
      ...enrichment,
      ...resolvedFields,
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
