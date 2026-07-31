import type { SocialProviderJob } from "./SocialProviderJob";

export function getSocialAttemptNeedsMedia({
  jobType,
  providerContainerId,
  providerPublishId,
}: {
  jobType: SocialProviderJob["jobType"];
  providerContainerId?: string;
  providerPublishId?: string;
}) {
  return (
    jobType === "social-publish" && !providerContainerId && !providerPublishId
  );
}
