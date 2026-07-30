import type { SocialProviderJob } from "./SocialProviderJob";
import type { SocialPublishDocument } from "./SocialPublishDocument";

export function selectSocialPublishAttempt(
  attempts: SocialPublishDocument["attempts"],
  jobType: SocialProviderJob["jobType"],
) {
  const newestFirst = [...attempts].reverse();

  if (jobType === "social-status-reconcile") {
    return newestFirst.find(
      (attempt) =>
        attempt.status === "running" || attempt.status === "ambiguous",
    );
  }

  return newestFirst.find((attempt) => attempt.status === "running");
}
