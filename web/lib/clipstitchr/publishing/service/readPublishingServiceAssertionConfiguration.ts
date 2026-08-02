import "server-only";

import type { PublishingServiceAssertionConfiguration } from "@/lib/clipstitchr/publishing/service/PublishingServiceAssertionConfiguration";
import { PublishingServiceConfigurationError } from "@/lib/clipstitchr/publishing/service/PublishingServiceConfigurationError";
import { createServiceAssertionSigningKey } from "@/services/publishing-service/src/assertions/createServiceAssertionSigningKey";

export function readPublishingServiceAssertionConfiguration(): PublishingServiceAssertionConfiguration {
  const audience = process.env.PUBLISHING_SERVICE_AUDIENCE?.trim();
  const issuer = process.env.PUBLISHING_SERVICE_ISSUER?.trim();
  const encodedSigningKey =
    process.env.PUBLISHING_SERVICE_ASSERTION_KEY_BASE64?.trim();

  if (!audience || !issuer || !encodedSigningKey) {
    throw new PublishingServiceConfigurationError();
  }

  try {
    return {
      audience,
      issuer,
      signingKey: createServiceAssertionSigningKey(encodedSigningKey),
    };
  } catch {
    throw new PublishingServiceConfigurationError();
  }
}
