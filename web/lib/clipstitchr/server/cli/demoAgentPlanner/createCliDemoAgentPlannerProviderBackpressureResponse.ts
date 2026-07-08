import { getCliDemoAgentPlannerProviderBackpressureRetryAfterSeconds } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/getCliDemoAgentPlannerProviderBackpressureRetryAfterSeconds";

export function createCliDemoAgentPlannerProviderBackpressureResponse(
  error: unknown,
) {
  const retryAfterSeconds =
    getCliDemoAgentPlannerProviderBackpressureRetryAfterSeconds(error);

  if (retryAfterSeconds === undefined) {
    return null;
  }

  const message = `Planner provider is busy. Try again in ${retryAfterSeconds} seconds.`;

  return Response.json(
    {
      error: message,
      message,
      providerBackpressure: true,
      retryAfterSeconds,
    },
    {
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
      status: 429,
    },
  );
}
