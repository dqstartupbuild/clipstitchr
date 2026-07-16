import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { getStripeChargeBillingContext } from "./getStripeChargeBillingContext";

const mocks = vi.hoisted(() => ({ getStripeInvoiceSnapshot: vi.fn() }));

vi.mock("./getStripeInvoiceSnapshot", () => ({
  getStripeInvoiceSnapshot: mocks.getStripeInvoiceSnapshot,
}));

describe("getStripeChargeBillingContext", () => {
  it("falls back from PaymentIntent to invoice-linked monthly grants", async () => {
    const monthlyGrant = { grantId: "monthly_1", ownerId: "owner_1" };
    const ctx = {
      db: {
        query: vi.fn((table: string) => ({
          withIndex: vi.fn((indexName: string) => ({
            collect: vi.fn(async () =>
              table === "creditGrants" && indexName === "by_invoice"
                ? [monthlyGrant]
                : [],
            ),
            unique: vi.fn(async () =>
              table === "billingEntitlements"
                ? { ownerId: "owner_1", planKey: "pro" }
                : null,
            ),
          })),
        })),
      },
    };

    await expect(
      getStripeChargeBillingContext(
        ctx as never,
        {
          customer: "cus_owner",
          id: "ch_monthly",
          invoice: "in_monthly",
          payment_intent: "pi_monthly",
        } as unknown as Stripe.Charge,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        grants: [monthlyGrant],
        invoiceId: "in_monthly",
        ownerId: "owner_1",
      }),
    );
  });

  it("resolves the signed PaymentIntent owner before entitlement or grant creation", async () => {
    const ctx = {
      db: {
        query: vi.fn((table: string) => {
          const query = {
            collect: vi.fn(async () => []),
            unique: vi.fn(async () =>
              table === "billingCheckoutSessions"
                ? {
                    catalogKey: "creation-credit-refill",
                    mode: "payment",
                    ownerId: "owner_1",
                  }
                : null,
            ),
            withIndex: vi.fn(() => query),
          };

          return query;
        }),
      },
    };

    await expect(
      getStripeChargeBillingContext(
        ctx as never,
        {
          customer: "cus_owner",
          id: "ch_refill",
          payment_intent: {
            id: "pi_refill",
            metadata: {
              catalogKey: "creation-credit-refill",
              checkoutIntentId: "checkout_intent_1",
              ownerId: "owner_1",
            },
          },
        } as unknown as Stripe.Charge,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        grants: [],
        ownerId: "owner_1",
        paymentIntentId: "pi_refill",
      }),
    );
  });

  it("rejects refill metadata without its server-recorded Checkout", async () => {
    const ctx = {
      db: {
        query: vi.fn(() => {
          const query = {
            collect: vi.fn(async () => []),
            unique: vi.fn(async () => null),
            withIndex: vi.fn(() => query),
          };

          return query;
        }),
      },
    };

    await expect(
      getStripeChargeBillingContext(
        ctx as never,
        {
          customer: "cus_owner",
          id: "ch_refill",
          payment_intent: {
            id: "pi_refill",
            metadata: {
              catalogKey: "creation-credit-refill",
              checkoutIntentId: "checkout_intent_missing",
              ownerId: "owner_1",
            },
          },
        } as unknown as Stripe.Charge,
      ),
    ).rejects.toThrow("Checkout owner could not be verified");
  });

  it("resolves the signed invoice owner before entitlement or grant creation", async () => {
    mocks.getStripeInvoiceSnapshot.mockReturnValueOnce({ ownerId: "owner_1" });
    const ctx = {
      db: {
        query: vi.fn(() => {
          const query = {
            collect: vi.fn(async () => []),
            unique: vi.fn(async () => null),
            withIndex: vi.fn(() => query),
          };

          return query;
        }),
      },
    };

    await expect(
      getStripeChargeBillingContext(
        ctx as never,
        {
          customer: "cus_owner",
          id: "ch_monthly",
          invoice: { id: "in_monthly" },
          payment_intent: "pi_monthly",
        } as unknown as Stripe.Charge,
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        grants: [],
        invoiceId: "in_monthly",
        ownerId: "owner_1",
      }),
    );
  });
});
