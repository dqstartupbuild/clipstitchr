import type { ServiceAssertionSigningKey } from "@/services/publishing-service/src/assertions/ServiceAssertionSigningKey";

export type PublishingServiceAssertionConfiguration = {
  audience: string;
  issuer: string;
  signingKey: ServiceAssertionSigningKey;
};
