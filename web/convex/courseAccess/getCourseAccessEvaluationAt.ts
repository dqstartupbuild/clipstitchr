import type { Doc } from "../_generated/dataModel";

export function getCourseAccessEvaluationAt(
  contact: Doc<"marketingContacts">,
  requestedAt: number,
) {
  const stopTimes: number[] = [];

  if (contact.subscriptionStatus !== "subscribed") {
    stopTimes.push(contact.subscriptionChangedAt ?? requestedAt);
  }
  if (contact.suppressionStatus !== "none") {
    stopTimes.push(contact.suppressionChangedAt ?? requestedAt);
  }
  if (contact.deletionStatus !== "active") {
    stopTimes.push(contact.deletionChangedAt ?? requestedAt);
  }

  return stopTimes.length === 0
    ? requestedAt
    : Math.min(requestedAt, ...stopTimes);
}
