import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";

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

    const body = await readCliJsonObject(request);
    const userCode = readCliRequiredString(body, "userCode", "sign-in code");
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const result = await convex.mutation(
      api.cliAuth.approveDeviceAuthorization.approveDeviceAuthorization,
      {
        approvedAt: new Date().toISOString(),
        userCode,
      },
    );

    return NextResponse.json(result);
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
            : "Unable to connect this machine.",
      },
      { status: 400 },
    );
  }
}
