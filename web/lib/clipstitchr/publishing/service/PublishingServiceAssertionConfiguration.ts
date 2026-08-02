import type { ServiceAssertionSigningKey } from "@clipstitchr/publishing-service";

export type PublishingServiceAssertionConfiguration = {
  audience: string;
  issuer: string;
  signingKey: ServiceAssertionSigningKey;
};
