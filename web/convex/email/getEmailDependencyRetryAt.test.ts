import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getEmailDependencyRetryAt } from "./getEmailDependencyRetryAt";

describe("email dependency retry time", () => {
  it("waits past the dependency lease or its next attempt", () => {
    expect(
      getEmailDependencyRetryAt(
        {
          leaseExpiresAt: 20_000,
          nextAttemptAt: 10_000,
        } as Doc<"emailProviderOperations">,
        5_000,
      ),
    ).toBe(21_000);
    expect(
      getEmailDependencyRetryAt(
        { nextAttemptAt: 0 } as Doc<"emailProviderOperations">,
        5_000,
      ),
    ).toBe(10_000);
  });
});
