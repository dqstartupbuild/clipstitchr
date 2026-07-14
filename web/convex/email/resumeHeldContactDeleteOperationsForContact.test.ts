import { describe, expect, it, vi } from "vitest";
import { resumeHeldContactDeleteOperationsForContact } from "./resumeHeldContactDeleteOperationsForContact";

vi.mock("../_generated/api", () => ({
  internal: {
    email: {
      processEmailProviderOperation: {
        processEmailProviderOperation: "process-email-operation",
      },
    },
  },
}));

describe("resumeHeldContactDeleteOperationsForContact", () => {
  it("resumes only held privacy-delete operations for the contact", async () => {
    const operations = [
      { _id: "delete_1", kind: "contactDelete", status: "held" },
      { _id: "sync_1", kind: "contactSync", status: "held" },
    ];
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const queryChain = {
      collect: vi.fn(async () => operations),
      withIndex: vi.fn((_name, callback) => {
        callback(indexQuery);
        return queryChain;
      }),
    };
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
      scheduler: { runAfter: vi.fn() },
    };

    await expect(
      resumeHeldContactDeleteOperationsForContact(ctx as never, {
        contactId: "contact_1" as never,
        now: 100,
      }),
    ).resolves.toBe(1);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "delete_1",
      expect.objectContaining({ status: "pending" }),
    );
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "sync_1",
      expect.anything(),
    );
  });
});
