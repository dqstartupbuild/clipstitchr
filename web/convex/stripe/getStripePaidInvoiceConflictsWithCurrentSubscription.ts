export function getStripePaidInvoiceConflictsWithCurrentSubscription(
  entitlement: {
    currentPeriodEnd: string;
    graceEndsAt?: string;
    state: "active" | "grace" | "inactive";
    stripeSubscriptionId: string;
  },
  incoming: { createdAt: number; subscriptionId: string },
) {
  if (entitlement.stripeSubscriptionId === incoming.subscriptionId) {
    return false;
  }

  const incomingAt = incoming.createdAt * 1_000;
  const periodEndAt = Date.parse(entitlement.currentPeriodEnd);
  const graceEndsAt = entitlement.graceEndsAt
    ? Date.parse(entitlement.graceEndsAt)
    : Number.NaN;

  return (
    (entitlement.state === "active" &&
      (!Number.isFinite(periodEndAt) || periodEndAt > incomingAt)) ||
    (entitlement.state === "grace" &&
      (!Number.isFinite(graceEndsAt) || graceEndsAt > incomingAt))
  );
}
