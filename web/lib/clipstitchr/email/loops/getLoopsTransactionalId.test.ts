import { describe, expect, it } from "vitest";
import { getLoopsTransactionalId } from "@/lib/clipstitchr/email/loops/getLoopsTransactionalId";

describe("getLoopsTransactionalId", () => {
  it("maps only the approved server-side confirmation template", () => {
    expect(
      getLoopsTransactionalId("email-confirmation", {
        LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID: "transactional_123",
      }),
    ).toBe("transactional_123");

    expect(() =>
      getLoopsTransactionalId("visitor-supplied-template", {
        LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID: "transactional_123",
      }),
    ).toThrow("The Loops transactional template is not approved.");
  });
});
