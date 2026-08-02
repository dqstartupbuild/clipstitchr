import { getPublishingMediaFetchRequirements } from "@/lib/clipstitchr/publishing/media/getPublishingMediaFetchRequirements";
import { isPublicHttpsPublishingMediaUrl } from "@/lib/clipstitchr/publishing/media/isPublicHttpsPublishingMediaUrl";
import { isConfiguredPublishingMediaOrigin } from "@/lib/clipstitchr/publishing/media/isConfiguredPublishingMediaOrigin";
import type { PublishingMediaFetchGrant } from "@/lib/clipstitchr/publishing/media/PublishingMediaFetchGrant";
import type { PublishingMediaProvider } from "@/lib/clipstitchr/publishing/media/PublishingMediaProvider";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

export function assertPublishingMediaFetchGrantReady(
  grant: PublishingMediaFetchGrant,
  provider: PublishingMediaProvider,
  nowEpochMs = Date.now(),
  verifiedClipStitchrOrigin?: string,
) {
  const requirements = getPublishingMediaFetchRequirements(provider);
  const remainingMilliseconds = grant.expiresAtEpochMs - nowEpochMs;

  if (!isPublicHttpsPublishingMediaUrl(grant.url)) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "The provider media URL must be a public HTTPS URL.",
    );
  }

  if (
    !Number.isFinite(grant.expiresAtEpochMs) ||
    remainingMilliseconds < requirements.minimumRemainingSeconds * 1000
  ) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "The provider media URL expires too soon. Sign it immediately before publishing.",
    );
  }

  if (!grant.supportsGet) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "The provider media URL must support a complete GET request.",
    );
  }

  if (
    requirements.requiresVerifiedClipStitchrDomain &&
    !isConfiguredPublishingMediaOrigin(
      grant.url,
      verifiedClipStitchrOrigin,
    )
  ) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "TikTok media URLs must use a verified ClipStitchr-owned HTTPS domain.",
    );
  }

  if (requirements.requiresNoRedirect && !grant.supportsNoRedirectFetch) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "TikTok media URLs must serve the object directly without redirects.",
    );
  }

  if (requirements.requiresHead && !grant.supportsHead) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "TikTok media URLs must support HEAD requests.",
    );
  }

  if (requirements.requiresRange && !grant.supportsRange) {
    throw new PublishingMediaValidationError(
      "fetch_url_not_ready",
      "TikTok media URLs must support byte-range reads.",
    );
  }

  return Object.freeze({ ...grant });
}
