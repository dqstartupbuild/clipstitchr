import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { createCliDemoGuideGeneration } from "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuideGeneration";
import { readCliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/readCliDemoGuideGenerateRequest";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readCliJsonObject(request);
    const guideRequest = readCliDemoGuideGenerateRequest(body);
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();
    const product = await convex.query(
      api.cliProducts.getCliProductDocument.getCliProductDocument,
      {
        id: guideRequest.productId,
        ownerId: session.ownerId,
        secret,
      },
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 400 },
      );
    }

    await convex.mutation(api.rateLimits.consumeCliDemoGuideGenerate, {
      ownerId: session.ownerId,
      secret,
    });

    const generation = await createCliDemoGuideGeneration({
      createdAt: new Date().toISOString(),
      product: createProductProfileFromConvexDocument(product),
      replicate: createReplicateClient(),
      request: guideRequest,
    });

    return NextResponse.json(generation);
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
            : "Unable to generate this walkthrough guide.",
      },
      { status: 500 },
    );
  }
}
