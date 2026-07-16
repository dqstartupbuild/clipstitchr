import type { EntitlementState } from "./types/EntitlementState";

export function getEffectiveEntitlementState(
  entitlement: {
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string;
    currentPeriodStart?: string;
    graceEndsAt?: string;
    state: EntitlementState;
    supportOverrideState?: EntitlementState;
    supportOverrideExpiresAt?: string;
  },
  now: string,
) {
  if (
    entitlement.supportOverrideState &&
    entitlement.supportOverrideExpiresAt &&
    Date.parse(entitlement.supportOverrideExpiresAt) > Date.parse(now)
  ) {
    return entitlement.supportOverrideState;
  }

  const nowMs = Date.parse(now);

  if (!Number.isFinite(nowMs)) {
    return "inactive";
  }

  if (
    entitlement.state === "grace" &&
    (!entitlement.graceEndsAt || Date.parse(entitlement.graceEndsAt) <= nowMs)
  ) {
    return "inactive";
  }

  if (entitlement.state === "active") {
    const periodEndMs = Date.parse(entitlement.currentPeriodEnd ?? "");
    const periodStartMs = entitlement.currentPeriodStart
      ? Date.parse(entitlement.currentPeriodStart)
      : undefined;

    if (
      !Number.isFinite(periodEndMs) ||
      periodEndMs <= nowMs ||
      (periodStartMs !== undefined &&
        (!Number.isFinite(periodStartMs) || periodStartMs > nowMs))
    ) {
      return "inactive";
    }
  }

  return entitlement.state;
}
