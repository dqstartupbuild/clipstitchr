import type { IncomingHttpHeaders } from "node:http";

import type { ServiceAssertionAction } from "../assertions/ServiceAssertionAction.js";
import type { ServiceAssertionReplayProtector } from "../assertions/ServiceAssertionReplayProtector.js";
import type { ServiceAssertionSigningKey } from "../assertions/ServiceAssertionSigningKey.js";

export type AuthenticatePublishingServiceRequestInput = Readonly<{
  headers: IncomingHttpHeaders;
  expectedAction: ServiceAssertionAction | readonly ServiceAssertionAction[];
  expectedAudience: string;
  expectedIssuer: string;
  replayProtector: ServiceAssertionReplayProtector;
  signingKey: ServiceAssertionSigningKey;
  nowEpochSeconds?: number;
}>;
