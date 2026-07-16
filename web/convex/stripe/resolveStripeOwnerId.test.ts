import { describe, expect, it, vi } from "vitest";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";

function createQuery(result: Record<string, unknown> | null) {
  const query = {
    unique: vi.fn(async () => result),
    withIndex: vi.fn(() => query),
  };

  return query;
}

function createContext(
  bySubscription: Record<string, unknown> | null,
  byCustomer: Record<string, unknown> | null,
) {
  return {
    db: {
      query: vi
        .fn()
        .mockReturnValueOnce(createQuery(bySubscription))
        .mockReturnValueOnce(createQuery(byCustomer)),
    },
  };
}

describe("resolveStripeOwnerId", () => {
  it("accepts consistent metadata and stored ownership", async () => {
    await expect(
      resolveStripeOwnerId(
        createContext(
          { ownerId: "owner_123" },
          { ownerId: "owner_123" },
        ) as never,
        {
          customerId: "cus_123",
          metadataOwnerId: "owner_123",
          subscriptionId: "sub_123",
        },
      ),
    ).resolves.toBe("owner_123");
  });

  it("rejects metadata that conflicts with the stored customer owner", async () => {
    await expect(
      resolveStripeOwnerId(
        createContext(null, { ownerId: "owner_stored" }) as never,
        {
          customerId: "cus_123",
          metadataOwnerId: "owner_metadata",
          subscriptionId: "sub_new",
        },
      ),
    ).rejects.toThrow(
      "Stripe billing ownership metadata conflicts with stored ownership.",
    );
  });

  it("rejects conflicting stored subscription and customer owners", async () => {
    await expect(
      resolveStripeOwnerId(
        createContext(
          { ownerId: "owner_subscription" },
          { ownerId: "owner_customer" },
        ) as never,
        { customerId: "cus_123", subscriptionId: "sub_123" },
      ),
    ).rejects.toThrow(
      "Stripe billing ownership metadata conflicts with stored ownership.",
    );
  });
});
