import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStripeInvoiceSnapshot } from "./getStripeInvoiceSnapshot";

describe("getStripeInvoiceSnapshot", () => {
  beforeEach(() => {
    vi.stubEnv("CLIPSTITCHR_STRIPE_MODE", "test");
    vi.stubEnv("STRIPE_STARTER_PRICE_ID", "price_starter");
    vi.stubEnv("STRIPE_STARTER_PRODUCT_ID", "prod_starter");
    vi.stubEnv("STRIPE_PRO_PRICE_ID", "price_pro");
    vi.stubEnv("STRIPE_PRO_PRODUCT_ID", "prod_pro");
    vi.stubEnv("STRIPE_AGENCY_PRICE_ID", "price_agency");
    vi.stubEnv("STRIPE_AGENCY_PRODUCT_ID", "prod_agency");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("selects the positive new-plan line on a prorated upgrade invoice", () => {
    const invoice = {
      id: "in_upgrade",
      billing_reason: "subscription_update",
      customer: "cus_1",
      lines: {
        data: [
          {
            amount: -1_900,
            period: { end: 1_789_000_000, start: 1_786_000_000 },
            pricing: { price_details: { price: "price_starter" } },
            subscription: "sub_1",
          },
          {
            amount: 4_900,
            parent: {
              invoice_item_details: null,
              subscription_item_details: {
                invoice_item: "ii_pro_debit",
                proration: true,
                proration_details: {
                  credited_items: null,
                },
                subscription: "sub_1",
                subscription_item: "si_1",
              },
              type: "subscription_item_details",
            },
            period: { end: 1_789_000_000, start: 1_786_000_000 },
            pricing: { price_details: { price: "price_pro" } },
            subscription: "sub_1",
          },
        ],
      },
      metadata: {},
      period_start: 1_785_900_000,
      parent: {
        subscription_details: {
          metadata: { ownerId: "owner_1", planKey: "starter" },
          subscription: "sub_1",
        },
      },
    } as unknown as Stripe.Invoice;

    const snapshot = getStripeInvoiceSnapshot(invoice);

    expect(snapshot.planKey).toBe("pro");
    expect(snapshot.priceId).toBe("price_pro");
    expect(snapshot.periodStart).toBe("2026-08-05T03:20:00.000Z");
  });

  it("uses the subscription line period start for a normal renewal", () => {
    const previousPeriodStart = Math.floor(
      Date.parse("2026-07-18T00:00:00.000Z") / 1_000,
    );
    const renewalPeriodStart = Math.floor(
      Date.parse("2026-08-18T00:00:00.000Z") / 1_000,
    );
    const renewalPeriodEnd = Math.floor(
      Date.parse("2026-09-18T00:00:00.000Z") / 1_000,
    );

    const invoice = {
      id: "in_renewal",
      billing_reason: "subscription_cycle",
      customer: "cus_1",
      lines: {
        data: [
          {
            amount: 3_900,
            parent: {
              invoice_item_details: null,
              subscription_item_details: {
                invoice_item: "ii_renewal",
                proration: false,
                proration_details: {
                  credited_items: null,
                },
                subscription: "sub_1",
                subscription_item: "si_1",
              },
              type: "subscription_item_details",
            },
            period: {
              start: renewalPeriodStart,
              end: renewalPeriodEnd,
            },
            pricing: {
              price_details: {
                price: "price_starter",
              },
            },
            subscription: "sub_1",
          },
        ],
      },
      metadata: {},
      period_start: previousPeriodStart,
      parent: {
        subscription_details: {
          metadata: {
            ownerId: "owner_1",
            planKey: "starter",
          },
          subscription: "sub_1",
        },
      },
    } as unknown as Stripe.Invoice;

    const snapshot = getStripeInvoiceSnapshot(invoice);

    expect(snapshot.periodStart).toBe("2026-08-18T00:00:00.000Z");
    expect(snapshot.periodEnd).toBe("2026-09-18T00:00:00.000Z");
  });

  it("selects the new plan when a full discount makes both prorations zero", () => {
    const invoice = {
      id: "in_discounted_upgrade",
      billing_reason: "subscription_update",
      customer: "cus_1",
      lines: {
        data: [
          {
            amount: 0,
            parent: {
              invoice_item_details: null,
              subscription_item_details: {
                invoice_item: "ii_starter_credit",
                proration: true,
                proration_details: {
                  credited_items: {
                    invoice: "in_starter",
                    invoice_line_items: ["il_starter"],
                  },
                },
                subscription: "sub_1",
                subscription_item: "si_1",
              },
              type: "subscription_item_details",
            },
            period: { end: 1_789_000_000, start: 1_786_000_000 },
            pricing: { price_details: { price: "price_starter" } },
            subscription: "sub_1",
          },
          {
            amount: 0,
            parent: {
              invoice_item_details: null,
              subscription_item_details: {
                invoice_item: "ii_agency_debit",
                proration: true,
                proration_details: { credited_items: null },
                subscription: "sub_1",
                subscription_item: "si_1",
              },
              type: "subscription_item_details",
            },
            period: { end: 1_789_000_000, start: 1_786_000_000 },
            pricing: { price_details: { price: "price_agency" } },
            subscription: "sub_1",
          },
        ],
      },
      metadata: {},
      period_start: 1_785_900_000,
      parent: {
        subscription_details: {
          metadata: { ownerId: "owner_1", planKey: "agency" },
          subscription: "sub_1",
        },
      },
    } as unknown as Stripe.Invoice;

    const snapshot = getStripeInvoiceSnapshot(invoice);

    expect(snapshot.planKey).toBe("agency");
    expect(snapshot.priceId).toBe("price_agency");
  });
});
