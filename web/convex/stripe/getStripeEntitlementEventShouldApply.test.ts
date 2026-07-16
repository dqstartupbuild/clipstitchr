import { describe, expect, it } from "vitest";
import { getStripeEntitlementEventShouldApply } from "./getStripeEntitlementEventShouldApply";

describe("getStripeEntitlementEventShouldApply", () => {
  it("rejects an older event across Stripe event families", () => {
    expect(
      getStripeEntitlementEventShouldApply({
        current: {
          createdAt: 200,
          eventId: "evt_current",
          eventType: "invoice.paid",
          state: "active",
        },
        incoming: {
          createdAt: 199,
          eventId: "evt_incoming",
          eventType: "customer.subscription.updated",
          state: "inactive",
        },
      }),
    ).toBe(false);
  });

  it("lets terminal state beat paid state in the same Stripe second", () => {
    expect(
      getStripeEntitlementEventShouldApply({
        current: {
          createdAt: 200,
          eventId: "evt_paid",
          eventType: "invoice.paid",
          state: "active",
        },
        incoming: {
          createdAt: 200,
          eventId: "evt_deleted",
          eventType: "customer.subscription.deleted",
          state: "inactive",
        },
      }),
    ).toBe(true);
    expect(
      getStripeEntitlementEventShouldApply({
        current: {
          createdAt: 200,
          eventId: "evt_deleted",
          eventType: "customer.subscription.deleted",
          state: "inactive",
        },
        incoming: {
          createdAt: 200,
          eventId: "evt_paid",
          eventType: "invoice.paid",
          state: "active",
        },
      }),
    ).toBe(false);
  });

  it("lets paid state beat incomplete and failed state in the same Stripe second", () => {
    for (const incoming of [
      {
        eventId: "evt_incomplete",
        eventType: "customer.subscription.created",
        state: "inactive" as const,
      },
      {
        eventId: "evt_failed",
        eventType: "invoice.payment_failed",
        state: "grace" as const,
      },
    ]) {
      expect(
        getStripeEntitlementEventShouldApply({
          current: {
            createdAt: 200,
            eventId: "evt_paid",
            eventType: "invoice.paid",
            state: "active",
          },
          incoming: { createdAt: 200, ...incoming },
        }),
      ).toBe(false);
    }
  });

  it("does not treat Stripe event IDs as same-priority chronology", () => {
    for (const [currentId, incomingId] of [
      ["evt_zzz", "evt_aaa"],
      ["evt_aaa", "evt_zzz"],
    ]) {
      expect(
        getStripeEntitlementEventShouldApply({
          current: {
            createdAt: 200,
            eventId: currentId,
            eventType: "customer.subscription.updated",
            state: "active",
          },
          incoming: {
            createdAt: 200,
            eventId: incomingId,
            eventType: "customer.subscription.updated",
            state: "active",
          },
        }),
      ).toBe(false);
    }
  });
});
