import type { ServiceAssertionAction } from "@clipstitchr/publishing-service";

export type IssueAuthenticatedPublishingServiceAssertionInput = {
  action: ServiceAssertionAction;
  requestId: string;
};
