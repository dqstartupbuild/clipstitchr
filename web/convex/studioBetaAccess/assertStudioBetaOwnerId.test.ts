import { describe, expect, it } from "vitest";
import { assertStudioBetaOwnerId } from "./assertStudioBetaOwnerId";

describe("assertStudioBetaOwnerId", () => {
  it("accepts an immutable Clerk user ID", () => {
    expect(() => assertStudioBetaOwnerId("user_2abc-XYZ_9")).not.toThrow();
  });

  it.each([
    "person@example.com",
    "owner_123",
    " user_123",
    "user_123 ",
    "user_abc/123",
    "",
  ])("rejects %s", (ownerId) => {
    expect(() => assertStudioBetaOwnerId(ownerId)).toThrow(
      "valid Clerk user ID",
    );
  });
});
