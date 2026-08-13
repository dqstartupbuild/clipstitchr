import type { ServiceAssertionAction } from "@/services/publishing-service/src/assertions/ServiceAssertionAction";

export type IssueAuthenticatedPublishingServiceAssertionInput = {
  action: ServiceAssertionAction;
  requestId: string;
};
