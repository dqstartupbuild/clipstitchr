import { describe, expect, it, vi } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { upsertMarketingContactForCapture } from "./upsertMarketingContactForCapture";

function createContext(existing: Doc<"marketingContacts">) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const chain = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return chain;
    }),
  };

  return {
    db: {
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("marketing contact capture upsert", () => {
  it("sets first tool on a migrated signup-page contact during explicit re-consent", async () => {
    const existing = {
      _id: "contact_1",
      consentStatus: "consentUnknown",
      deletionStatus: "active",
      firstTool: undefined,
      leadStage: "captured",
      marketingEligible: false,
      subscriptionStatus: "notSubscribed",
      suppressionStatus: "none",
      verificationStatus: "unverified",
    } as Doc<"marketingContacts">;
    const ctx = createContext(existing);

    await upsertMarketingContactForCapture(ctx as never, {
      capturedAt: 100,
      contactName: "Person Name",
      leadSegment: "hooks-and-messaging",
      leadStage: "captured",
      normalizedEmail: "person@example.com",
      providerContactKey: "unused-new-key",
      source: "app-hook-generator",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "contact_1",
      expect.objectContaining({
        firstTool: "app-hook-generator",
        latestTool: "app-hook-generator",
      }),
    );
  });
});
