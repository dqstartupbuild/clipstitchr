import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "../_generated/server";
import { applyProviderDeletionTombstone } from "./applyProviderDeletionTombstone";

const mocks = vi.hoisted(() => ({
  cancelEmailProviderOperationsForContact: vi.fn(),
  stopCourseReleasesForContact: vi.fn(),
}));

vi.mock("../email/cancelEmailProviderOperationsForContact", () => ({
  cancelEmailProviderOperationsForContact:
    mocks.cancelEmailProviderOperationsForContact,
}));
vi.mock("../courseAccess/stopCourseReleasesForContact", () => ({
  stopCourseReleasesForContact: mocks.stopCourseReleasesForContact,
}));

function createContext(contact: Record<string, unknown>) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const chain = {
    unique: vi.fn(async () => contact),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return chain;
    }),
  };

  return {
    db: {
      insert: vi.fn(async () => "tombstone_1"),
      patch: vi.fn(),
      query: vi.fn(() => chain),
    },
  };
}

describe("provider deletion tombstone precedence", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fences in-flight provider updates after applying a deletion", async () => {
    const contact = {
      _id: "contact_1",
      deletionStatus: "active",
      providerContactKey: "provider_key_1",
    };
    const ctx = createContext(contact);

    await expect(
      applyProviderDeletionTombstone(ctx as unknown as MutationCtx, {
        appliedAt: 300,
        eventAt: 200,
        providerContactKey: "provider_key_1",
        webhookId: "webhook_1",
      }),
    ).resolves.toMatchObject({ applied: true, contactId: "contact_1" });
    expect(mocks.cancelEmailProviderOperationsForContact).toHaveBeenCalledWith(
      ctx,
      "contact_1",
      300,
      { providerDeletionFence: true },
    );
    expect(mocks.stopCourseReleasesForContact).toHaveBeenCalledWith(
      ctx,
      "contact_1",
      200,
    );
  });

  it("never revives or relinks a privacy-deleted contact", async () => {
    const contact = {
      _id: "contact_1",
      deletionChangedAt: 100,
      deletionStatus: "privacyDeleted",
      providerContactKey: "provider_key_1",
    };
    const ctx = createContext(contact);

    await expect(
      applyProviderDeletionTombstone(ctx as unknown as MutationCtx, {
        appliedAt: 300,
        eventAt: 200,
        providerContactId: "provider_contact_1",
        providerContactKey: "provider_key_1",
        webhookId: "webhook_1",
      }),
    ).resolves.toEqual({
      applied: false,
      contactId: "contact_1",
      tombstoneId: "tombstone_1",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "providerDeletionTombstones",
      expect.objectContaining({ clearedAt: 300, contactId: "contact_1" }),
    );
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(
      mocks.cancelEmailProviderOperationsForContact,
    ).not.toHaveBeenCalled();
  });
});
