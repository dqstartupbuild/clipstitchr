import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export type ProviderPublishResult = Readonly<{
  provider: PublishingProvider;
  kind:
    | "accepted"
    | "media_transfer_pending"
    | "processing"
    | "requires_user_action"
    | "published"
    | "published_not_public"
    | "rejected"
    | "outcome_unknown";
  providerOperationId: string | undefined;
  remotePostIds: readonly string[];
  remoteUrls: readonly string[];
  visibility: string | undefined;
}>;
