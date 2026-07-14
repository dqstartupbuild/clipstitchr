import { describe, expect, it } from "vitest";
import { emailConfirmationRequestLogIgnorePattern } from "./emailConfirmationRequestLogIgnorePattern";

describe("email confirmation request log suppression", () => {
  it.each([
    "/email/confirm",
    "/email/confirm?id=opaque&expires=1&signature=secret",
  ])("suppresses the complete confirmation request URL: %s", (url) => {
    expect(emailConfirmationRequestLogIgnorePattern.test(url)).toBe(true);
  });

  it.each([
    "/email/confirmation",
    "/email/confirmations",
    "/api/email/confirm",
    "/dashboard",
  ])("keeps unrelated request logging enabled: %s", (url) => {
    expect(emailConfirmationRequestLogIgnorePattern.test(url)).toBe(false);
  });
});
