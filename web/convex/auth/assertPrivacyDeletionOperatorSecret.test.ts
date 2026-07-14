import { afterEach, describe, expect, it } from "vitest";
import { assertPrivacyDeletionOperatorSecret } from "./assertPrivacyDeletionOperatorSecret";

const originalSecret = process.env.PRIVACY_DELETION_OPERATOR_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.PRIVACY_DELETION_OPERATOR_SECRET;
  } else {
    process.env.PRIVACY_DELETION_OPERATOR_SECRET = originalSecret;
  }
});

describe("assertPrivacyDeletionOperatorSecret", () => {
  it("fails closed when the dedicated operator secret is absent", () => {
    delete process.env.PRIVACY_DELETION_OPERATOR_SECRET;

    expect(() => assertPrivacyDeletionOperatorSecret("provided")).toThrow(
      "Not authorized",
    );
  });

  it("rejects a mismatched secret", () => {
    process.env.PRIVACY_DELETION_OPERATOR_SECRET = "expected";

    expect(() => assertPrivacyDeletionOperatorSecret("provided")).toThrow(
      "Not authorized",
    );
  });

  it("accepts the configured secret", () => {
    process.env.PRIVACY_DELETION_OPERATOR_SECRET = "expected";

    expect(() => assertPrivacyDeletionOperatorSecret("expected")).not.toThrow();
  });
});
