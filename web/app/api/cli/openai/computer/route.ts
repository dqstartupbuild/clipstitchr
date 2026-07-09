import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliOpenAiComputerRelayRequest } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/readCliOpenAiComputerRelayRequest";
import { requestCliOpenAiComputerRelayResponse } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/requestCliOpenAiComputerRelayResponse";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
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
    const relayRequest = readCliOpenAiComputerRelayRequest(body);
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeCliOpenAiComputerRelay, {
      ownerId: session.ownerId,
      runId: relayRequest.runId,
      secret,
    });

    return NextResponse.json(
      await requestCliOpenAiComputerRelayResponse(relayRequest),
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
            : "Unable to run OpenAI Computer Use through ClipStitchr.",
      },
      { status: 500 },
    );
  }
}
