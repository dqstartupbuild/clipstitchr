import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { createCliDemoAgentPlannerGeneration } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerGeneration";
import { readCliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/readCliDemoAgentPlanRequest";
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
    const plannerRequest = readCliDemoAgentPlanRequest(body);
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeCliDemoAgentPlan, {
      ownerId: session.ownerId,
      secret,
    });

    return NextResponse.json(
      await createCliDemoAgentPlannerGeneration({
        replicate: createReplicateClient(),
        request: plannerRequest,
      }),
    );
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
            : "Unable to plan the next demo agent action.",
      },
      { status: 500 },
    );
  }
}
