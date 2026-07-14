import { describe, expect, it, vi } from "vitest";
import { migrateWaitlistContacts } from "./migrateWaitlistContacts";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: vi.fn(),
}));
vi.mock("../../lib/clipstitchr/email/contact/createProviderContactKey", () => ({
  createProviderContactKey: () => "a".repeat(43),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext({ alreadyMigrated = false } = {}) {
  const entry = {
    _creationTime: 50,
    _id: "waitlist_1",
    createdAt: "2026-07-13T12:00:00.000Z",
    email: "person@example.com",
    name: "Person Name",
    normalizedEmail: "person@example.com",
    source: "app-hook-generator",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };
  let contact: Record<string, unknown> | null = alreadyMigrated
    ? {
        _id: "contact_1",
        currentConsentId: "consent_1",
        legacyWaitlistId: "waitlist_1",
      }
    : null;
  const existingConsent = alreadyMigrated
    ? { _id: "consent_1", legacyWaitlistId: "waitlist_1" }
    : null;
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const db = {
    get: vi.fn(async () => contact),
    insert: vi.fn(async (table: string, fields: Record<string, unknown>) => {
      if (table === "marketingContacts") {
        contact = { _id: "contact_1", ...fields };
        return "contact_1";
      }
      return "consent_1";
    }),
    patch: vi.fn(),
    query: vi.fn((table: string) => {
      let indexName = "";
      const chain = {
        paginate: vi.fn(async () => ({
          continueCursor: "done",
          isDone: true,
          page: [entry],
        })),
        unique: vi.fn(async () => {
          if (table === "marketingConsents") return existingConsent;
          if (table !== "marketingContacts") return null;
          if (indexName === "by_provider_contact_key") return null;
          return alreadyMigrated ? contact : null;
        }),
        withIndex: vi.fn(
          (name: string, callback: (query: typeof indexQuery) => unknown) => {
            indexName = name;
            callback(indexQuery);
            return chain;
          },
        ),
      };
      return chain;
    }),
  };

  return { db };
}

describe("legacy waitlist migration", () => {
  it("preserves the waitlist and creates marketing-ineligible unknown consent", async () => {
    const ctx = createContext();

    await expect(
      getHandler(migrateWaitlistContacts)(ctx, {
        paginationOpts: { cursor: null, numItems: 100 },
        secret: "rate-limit-secret",
      }),
    ).resolves.toMatchObject({
      createdConsentCount: 1,
      createdContactCount: 1,
      processedCount: 1,
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "marketingContacts",
      expect.objectContaining({
        consentStatus: "consentUnknown",
        marketingEligible: false,
        verificationStatus: "unverified",
      }),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "marketingConsents",
      expect.objectContaining({
        legacyWaitlistId: "waitlist_1",
        status: "consentUnknown",
      }),
    );
    expect(ctx.db).not.toHaveProperty("delete");
  });

  it("is idempotent for an already migrated legacy row", async () => {
    const ctx = createContext({ alreadyMigrated: true });

    await expect(
      getHandler(migrateWaitlistContacts)(ctx, {
        paginationOpts: { cursor: null, numItems: 50 },
        secret: "rate-limit-secret",
      }),
    ).resolves.toMatchObject({
      createdConsentCount: 0,
      createdContactCount: 0,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
