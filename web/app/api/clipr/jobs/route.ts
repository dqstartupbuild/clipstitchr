import { NextResponse } from "next/server";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { captureCliprJobCreatedEvent } from "@/lib/clipstitchr/server/clipr/captureCliprJobCreatedEvent";
import { captureCliprJobFailedEvent } from "@/lib/clipstitchr/server/clipr/captureCliprJobFailedEvent";
import { failCliprJob } from "@/lib/clipstitchr/server/clipr/failCliprJob";
import { readCliprJobCreateRequest } from "@/lib/clipstitchr/server/clipr/readCliprJobCreateRequest";
import { runCliprJobCreation } from "@/lib/clipstitchr/server/clipr/runCliprJobCreation";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  const convexToken = await getAuthenticatedConvexToken();

  if (!convexToken) {
    return NextResponse.json(
      { message: "Unable to create a Convex auth token." },
      { status: 500 },
    );
  }

  const convex = createAuthenticatedConvexHttpClient(convexToken);
  const secret = getRateLimitApiSecret();
  const input = await readCliprJobCreateRequest(request);

  try {
    const job = await runCliprJobCreation({
      convex,
      input,
      secret,
      userId,
    });

    await captureCliprJobCreatedEvent({
      input,
      request,
      userId,
    });

    return NextResponse.json({ job });
  } catch (error) {
    await failCliprJob({
      convex,
      error,
      jobId: input.jobId,
      secret,
    });

    await captureCliprJobFailedEvent({
      error,
      input,
      request,
      userId,
    });

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate this Clipr clip.",
      },
      { status: 500 },
    );
  }
}
