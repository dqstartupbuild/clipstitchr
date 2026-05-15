import type { TikTokIdentityPayload } from "@/lib/clipstitchr/analytics/TikTokIdentityPayload";
import { getHasMarketingConsent } from "@/lib/clipstitchr/analytics/getHasMarketingConsent";
import { hashTikTokIdentifier } from "@/lib/clipstitchr/analytics/hashTikTokIdentifier";

type IdentifyTikTokUserOptions = {
  email?: string | null;
  externalId?: string | null;
  phoneNumber?: string | null;
};

export async function identifyTikTokUser({
  email,
  externalId,
  phoneNumber,
}: IdentifyTikTokUserOptions) {
  if (typeof window === "undefined" || !getHasMarketingConsent()) {
    return;
  }

  const [hashedEmail, hashedExternalId, hashedPhoneNumber] = await Promise.all([
    email ? hashTikTokIdentifier(email) : null,
    externalId ? hashTikTokIdentifier(externalId) : null,
    phoneNumber ? hashTikTokIdentifier(phoneNumber) : null,
  ]);
  const identityPayload: TikTokIdentityPayload = {};

  if (hashedEmail) {
    identityPayload.email = hashedEmail;
  }

  if (hashedExternalId) {
    identityPayload.external_id = hashedExternalId;
  }

  if (hashedPhoneNumber) {
    identityPayload.phone_number = hashedPhoneNumber;
  }

  if (Object.keys(identityPayload).length === 0) {
    return;
  }

  window.ttq?.identify?.(identityPayload);
}
