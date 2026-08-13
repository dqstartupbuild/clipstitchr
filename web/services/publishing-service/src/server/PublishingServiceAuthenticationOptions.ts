import type { ServiceAssertionReplayProtector } from "../assertions/ServiceAssertionReplayProtector.js";
import type { ServiceAssertionSigningKey } from "../assertions/ServiceAssertionSigningKey.js";

export type PublishingServiceAuthenticationOptions = Readonly<{
  audience: string;
  issuer: string;
  replayProtector: ServiceAssertionReplayProtector;
  signingKey: ServiceAssertionSigningKey;
}>;
