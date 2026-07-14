import { describe, expect, it, vi } from "vitest";
import { rotateBrowserRecognitionToken } from "./rotateBrowserRecognitionToken";

function createContext(previous: unknown, duplicate: unknown = null) {
  const results = [previous, duplicate];
  const query = vi.fn(() => {
    const result = results.shift();
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const chain = {
      unique: vi.fn(async () => result),
      withIndex: vi.fn((_name, callback) => {
        callback(indexQuery);
        return chain;
      }),
    };
    return chain;
  });

  return {
    db: {
      insert: vi.fn(async () => "recognition_2"),
      patch: vi.fn(),
      query,
    },
  };
}

describe("browser recognition rotation", () => {
  it("revokes the previous hash and stores only the replacement hash", async () => {
    const ctx = createContext({ _id: "recognition_1" });

    await rotateBrowserRecognitionToken(ctx as never, {
      contactId: "contact_1" as never,
      expiresAt: 200,
      issuedAt: 100,
      previousTokenHash: "a".repeat(64),
      tokenHash: "b".repeat(64),
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("recognition_1", {
      revokedAt: 100,
      revocationReason: "rotated",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith("browserRecognitionTokens", {
      contactId: "contact_1",
      expiresAt: 200,
      issuedAt: 100,
      tokenHash: "b".repeat(64),
    });
    expect(JSON.stringify(ctx.db.insert.mock.calls)).not.toContain(
      "plaintext",
    );
  });

  it("rejects a duplicate replacement hash", async () => {
    const ctx = createContext(null, { _id: "recognition_existing" });

    await expect(
      rotateBrowserRecognitionToken(ctx as never, {
        contactId: "contact_1" as never,
        expiresAt: 200,
        issuedAt: 100,
        previousTokenHash: "a".repeat(64),
        tokenHash: "b".repeat(64),
      }),
    ).rejects.toThrow("Invalid recognition token.");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
