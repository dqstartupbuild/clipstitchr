import type { Doc } from "../_generated/dataModel";
import { getMarketingContactNeedsProviderUnsubscribe } from "../marketingContacts/getMarketingContactNeedsProviderUnsubscribe";

export function getEmailOperationDispatchEligibility({
  contact,
  operation,
  tombstone,
}: {
  contact: Doc<"marketingContacts"> | null;
  operation: Doc<"emailProviderOperations">;
  tombstone: Doc<"providerDeletionTombstones"> | null;
}) {
  if (!contact) {
    return { eligible: false as const, reason: "deleted" as const };
  }

  if (operation.kind === "contactDelete") {
    return contact.deletionStatus === "privacyDeleted" ||
      contact.deletionStatus === "providerDeleted"
      ? { eligible: true as const }
      : { eligible: false as const, reason: "alreadyEligible" as const };
  }

  if (contact.deletionStatus === "privacyDeleted") {
    return { eligible: false as const, reason: "deleted" as const };
  }

  if (tombstone || contact.deletionStatus === "providerDeleted") {
    if (
      operation.kind === "transactional" &&
      operation.transactionalTemplateKey === "email-confirmation" &&
      contact.suppressionStatus === "none"
    ) {
      return { eligible: true as const };
    }

    return { eligible: false as const, reason: "providerDeleted" as const };
  }

  if (operation.kind === "contactUnsubscribe") {
    return getMarketingContactNeedsProviderUnsubscribe(contact)
      ? { eligible: true as const }
      : { eligible: false as const, reason: "alreadyEligible" as const };
  }

  if (contact.suppressionStatus !== "none") {
    return { eligible: false as const, reason: "suppressed" as const };
  }

  if (
    operation.kind === "transactional" &&
    operation.transactionalTemplateKey === "email-confirmation"
  ) {
    return { eligible: true as const };
  }

  if (
    contact.consentStatus !== "confirmed" ||
    contact.verificationStatus !== "verified" ||
    contact.subscriptionStatus !== "subscribed" ||
    !contact.marketingEligible
  ) {
    return { eligible: false as const, reason: "marketingIneligible" as const };
  }

  return { eligible: true as const };
}
