import type { ServiceAssertionAction } from "../assertions/ServiceAssertionAction.js";
import type { PublishingRateLimitAction } from "../rate-limits/PublishingRateLimitAction.js";
import type { PublishingServiceRouteHandlerInput } from "./PublishingServiceRouteHandlerInput.js";
import type { PublishingServiceRouteMatch } from "./PublishingServiceRouteMatch.js";
import type { PublishingServiceRouteResponse } from "./PublishingServiceRouteResponse.js";

export type PublishingServiceRoute = Readonly<{
  action: ServiceAssertionAction;
  additionalActions?: readonly ServiceAssertionAction[];
  body: "json" | "none";
  handle: (
    input: PublishingServiceRouteHandlerInput,
  ) => Promise<PublishingServiceRouteResponse>;
  match: (pathname: string) => PublishingServiceRouteMatch | null;
  maximumBodyBytes?: number;
  method: "DELETE" | "GET" | "PATCH" | "POST";
  rateLimitAction: PublishingRateLimitAction;
  rateLimitActionByAssertion?: Readonly<
    Partial<Record<ServiceAssertionAction, PublishingRateLimitAction>>
  >;
}>;
