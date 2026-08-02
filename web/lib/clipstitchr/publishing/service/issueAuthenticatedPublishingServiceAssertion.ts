import "server-only";

import type { IssueAuthenticatedPublishingServiceAssertionInput } from "@/lib/clipstitchr/publishing/service/IssueAuthenticatedPublishingServiceAssertionInput";
import { getAuthenticatedPublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/getAuthenticatedPublishingTenantIdentity";
import { createPublishingServiceClerkTenantIdentity } from "@/lib/clipstitchr/publishing/service/createPublishingServiceClerkTenantIdentity";
import { readPublishingServiceAssertionConfiguration } from "@/lib/clipstitchr/publishing/service/readPublishingServiceAssertionConfiguration";
import { issueServiceAssertion } from "@clipstitchr/publishing-service";

export async function issueAuthenticatedPublishingServiceAssertion({
  action,
  requestId,
}: IssueAuthenticatedPublishingServiceAssertionInput) {
  const identity = await getAuthenticatedPublishingTenantIdentity();
  const configuration = readPublishingServiceAssertionConfiguration();

  return issueServiceAssertion({
    action,
    audience: configuration.audience,
    identity: createPublishingServiceClerkTenantIdentity(identity),
    issuer: configuration.issuer,
    requestId,
    signingKey: configuration.signingKey,
  });
}
