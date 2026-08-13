import type { ServiceAssertionAction } from "./ServiceAssertionAction.js";
import type { ServiceAssertionSigningKey } from "./ServiceAssertionSigningKey.js";
import type { ServiceAssertionReplayProtector } from "./ServiceAssertionReplayProtector.js";

export type ServiceAssertionVerificationInput = Readonly<{
  assertion: string;
  expectedIssuer: string;
  expectedAudience: string;
  expectedAction: ServiceAssertionAction | readonly ServiceAssertionAction[];
  expectedRequestId: string;
  signingKey: ServiceAssertionSigningKey;
  replayProtector: ServiceAssertionReplayProtector;
  nowEpochSeconds?: number;
}>;
