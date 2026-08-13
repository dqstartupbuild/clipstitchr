import type { IncomingMessage } from "node:http";

import type { ServiceAssertionClaims } from "../assertions/ServiceAssertionClaims.js";
import type { PublishingServiceRouteMatch } from "./PublishingServiceRouteMatch.js";

export type PublishingServiceRouteHandlerInput = Readonly<{
  body: unknown;
  claims: ServiceAssertionClaims;
  match: PublishingServiceRouteMatch;
  request: IncomingMessage;
  searchParams: URLSearchParams;
}>;
