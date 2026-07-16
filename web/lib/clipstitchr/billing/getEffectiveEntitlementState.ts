import type { EntitlementState } from "./types/EntitlementState";

export function getEffectiveEntitlementState(
  entitlement: {
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string;
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

  if (
    entitlement.state === "grace" &&
    (!entitlement.graceEndsAt || Date.parse(entitlement.graceEndsAt) <= nowMs)
  ) {
    return "inactive";
  }

  if (
    entitlement.state === "active" &&
    entitlement.cancelAtPeriodEnd &&
    entitlement.currentPeriodEnd &&
    Date.parse(entitlement.currentPeriodEnd) <= nowMs
  ) {
    return "inactive";
  }

  return entitlement.state;
}
