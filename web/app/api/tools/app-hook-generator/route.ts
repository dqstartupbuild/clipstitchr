import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { AppHookGeneratorBodyTooLargeError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorBodyTooLargeError";
import { AppHookGeneratorInputError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorInputError";
import { createAppHookGeneratorClientKey } from "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorClientKey";
import { createAppHookGeneratorHooks } from "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorHooks";
import { createAppHookGeneratorRateLimitResponse } from "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorRateLimitResponse";
import { createAppHookGeneratorRequestGuardResponse } from "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorRequestGuardResponse";
import { readAppHookGeneratorJsonBody } from "@/lib/clipstitchr/tools/appHookGenerator/server/readAppHookGeneratorJsonBody";
import { readAppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/server/readAppHookGeneratorRequest";
import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestGuardResponse =
    createAppHookGeneratorRequestGuardResponse(request);

  if (requestGuardResponse) {
    return requestGuardResponse;
  }

  try {
    const body = await readAppHookGeneratorJsonBody(request);
    const input = readAppHookGeneratorRequest(body);
    const convex = createConvexHttpClient();

    await convex.mutation(api.appHookGeneratorRateLimit.consume, {
      key: createAppHookGeneratorClientKey(request),
      secret: getRateLimitApiSecret(),
    });

    return Response.json(
      {
        hooks: createAppHookGeneratorHooks(input),
        variationIndex: input.variationIndex,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    const rateLimitResponse =
      createAppHookGeneratorRateLimitResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (error instanceof AppHookGeneratorBodyTooLargeError) {
      return createPublicApiErrorResponse({ code: "body_too_large", message: "Check each field, then try again.", resolution: "Send a smaller JSON request within the documented field limits.", status: 413 });
    }

    if (error instanceof AppHookGeneratorInputError) {
      return createPublicApiErrorResponse({ code: "invalid_request", message: "Check each field, then try again.", resolution: "Provide all required fields in the documented formats.", status: 400 });
    }

    return createPublicApiErrorResponse({ code: "internal_error", message: "Unable to generate hooks right now.", resolution: "Wait briefly and retry. Contact support if the issue continues.", status: 500 });
  }
}
