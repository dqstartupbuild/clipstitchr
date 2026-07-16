import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { getCliProductCreationErrorMessage } from "@/lib/clipstitchr/server/cli/getCliProductCreationErrorMessage";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  const convex = createConvexHttpClient();
  const products = await convex.query(
    api.cliProducts.listCliProducts.listCliProducts,
    {
      ownerId: session.ownerId,
      secret: getRateLimitApiSecret(),
    },
  );

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readCliJsonObject(request);
    const convex = createConvexHttpClient();
    const product = await convex.mutation(
      api.cliProducts.createCliProduct.createCliProduct,
      {
        audienceDetails: readCliRequiredString(
          body,
          "audienceDetails",
          "audience",
        ),
        id: createId(),
        name: readCliRequiredString(body, "name", "product name"),
        ownerId: session.ownerId,
        productDetails: readCliRequiredString(
          body,
          "productDetails",
          "product details",
        ),
        secret: getRateLimitApiSecret(),
      },
    );

    return NextResponse.json({ product });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message: getCliProductCreationErrorMessage(error),
      },
      { status: 400 },
    );
  }
}
