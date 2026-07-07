import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { getDemoAgentRouteIsAllowed } from "./getDemoAgentRouteIsAllowed.js";

export function getDemoAgentUrlPolicyStopReason(
  policy: DemoAgentPolicy,
  url: string,
) {
  const parsedUrl = new URL(url);

  if (!policy.allowedOrigins.includes(parsedUrl.origin)) {
    return "external-navigation";
  }

  if (
    !policy.allowedRoutes.some((route) =>
      getDemoAgentRouteIsAllowed(parsedUrl.pathname || "/", route),
    )
  ) {
    return "disallowed-route";
  }

  return "url-policy-violation";
}
