import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";
import { createToolLeadRateLimitResponse } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadRateLimitResponse";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";
import { readToolLeadRequest } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadRequest";

export async function handleToolLeadRequest({
  request,
  source,
}: {
  request: Request;
  source: ToolLeadSource;
}) {
  if (!getToolLeadRequestIsSameOrigin(request)) {
    return Response.json(
      { message: "Unable to accept this request." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 403,
      },
    );
  }

  try {
    const input = await readToolLeadRequest(request);
    const secret = getRateLimitApiSecret();
    const convex = createConvexHttpClient();

    await convex.mutation(api.toolLeads.submit.submit, {
      ...input,
      clientKey: createToolLeadClientKey(request, secret),
      secret,
      source,
    });

    return Response.json(
      { accepted: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const rateLimitResponse = createToolLeadRateLimitResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (error instanceof ToolLeadRequestError) {
      return Response.json(
        { message: "Check your name and email, then try again." },
        {
          headers: { "Cache-Control": "private, no-store" },
          status: error.status,
        },
      );
    }

    return Response.json(
      { message: "Unable to join the mailing list right now." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 500,
      },
    );
  }
}
