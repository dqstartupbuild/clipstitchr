import type { SocialPublishDocument } from "./SocialPublishDocument";
import { SocialOutcomeUnknownError } from "./SocialOutcomeUnknownError";

export function assertSocialAttemptCanInitializeProvider(
  attempt: SocialPublishDocument["attempts"][number] | undefined,
) {
  if (
    attempt?.retrySafety === "do_not_retry_reconcile_only" ||
    attempt?.stage === "provider_initialization_requested" ||
    attempt?.stage === "final_publish_requested"
  ) {
    throw new SocialOutcomeUnknownError(
      "The provider may already have this post. ClipStitchr will not send it again automatically.",
    );
  }
}
