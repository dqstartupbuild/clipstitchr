import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { getDemoAgentRouteIsAllowed } from "./getDemoAgentRouteIsAllowed.js";

export function assertDemoAgentUrlAllowed(
  policy: DemoAgentPolicy,
  url: string,
) {
  const parsedUrl = new URL(url);

  if (!policy.allowedOrigins.includes(parsedUrl.origin)) {
    throw new Error(`The agent cannot leave ${policy.allowedOrigins.join(", ")}.`);
  }

  if (
    !policy.allowedRoutes.some((route) =>
      getDemoAgentRouteIsAllowed(parsedUrl.pathname || "/", route),
    )
  ) {
    throw new Error(`The agent cannot use route ${parsedUrl.pathname || "/"}.`);
  }
}
