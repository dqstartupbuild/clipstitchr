import type { Doc } from "../_generated/dataModel";

export function getMarketingContactNeedsProviderUnsubscribe(
  contact: Doc<"marketingContacts">,
) {
  return (
    contact.consentStatus !== "confirmed" ||
    contact.verificationStatus !== "verified" ||
    contact.subscriptionStatus !== "subscribed" ||
    contact.suppressionStatus !== "none" ||
    contact.deletionStatus !== "active" ||
    !contact.marketingEligible
  );
}
