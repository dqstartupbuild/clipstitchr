import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmailConfirmationToken } from "./createEmailConfirmationToken";

const mocks = vi.hoisted(() => ({
  supersedeEmailConfirmationOperations: vi.fn(),
}));

vi.mock("./supersedeEmailConfirmationOperations", () => ({
  supersedeEmailConfirmationOperations:
    mocks.supersedeEmailConfirmationOperations,
}));

function createContext() {
  let queryCount = 0;

  return {
    db: {
      insert: vi.fn(async () => "confirmation_3"),
      patch: vi.fn(),
      query: vi.fn(() => {
        queryCount += 1;
        const indexQuery = { eq: vi.fn(() => indexQuery) };
        const chain = {
          collect: vi.fn(async () => [
            { _id: "confirmation_1", generation: 1 },
            { _id: "confirmation_2", generation: 2, usedAt: 90 },
          ]),
          unique: vi.fn(async () => (queryCount === 1 ? null : undefined)),
          withIndex: vi.fn((_name, callback) => {
            callback(indexQuery);
            return chain;
          }),
        };
        return chain;
      }),
    },
  };
}

describe("email confirmation token rotation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("increments generation and supersedes every older active token and send", async () => {
    const ctx = createContext();

    await createEmailConfirmationToken(ctx as never, {
      contactId: "contact_1" as never,
      createdAt: 100,
      expiresAt: 200,
      tokenDigest: "a".repeat(64),
      tokenRecordId: "record_3",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("confirmation_1", {
      supersededAt: 100,
    });
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "confirmation_2",
      expect.anything(),
    );
    expect(mocks.supersedeEmailConfirmationOperations).toHaveBeenCalledWith(
      ctx,
      "contact_1",
      100,
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "emailConfirmationTokens",
      expect.objectContaining({ generation: 3 }),
    );
  });
});
