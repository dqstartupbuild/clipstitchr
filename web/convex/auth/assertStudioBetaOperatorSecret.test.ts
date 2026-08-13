import { afterEach, describe, expect, it } from "vitest";
import { assertStudioBetaOperatorSecret } from "./assertStudioBetaOperatorSecret";

describe("assertStudioBetaOperatorSecret", () => {
  const originalSecret = process.env.STUDIO_BETA_OPERATOR_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.STUDIO_BETA_OPERATOR_SECRET;
    } else {
      process.env.STUDIO_BETA_OPERATOR_SECRET = originalSecret;
    }
  });

  it("fails closed when configuration is missing", () => {
    delete process.env.STUDIO_BETA_OPERATOR_SECRET;

    expect(() => assertStudioBetaOperatorSecret("provided")).toThrow(
      "Not authorized",
    );
  });

  it("rejects a different secret", () => {
    process.env.STUDIO_BETA_OPERATOR_SECRET = "expected-secret";

    expect(() => assertStudioBetaOperatorSecret("other-secret")).toThrow(
      "Not authorized",
    );
  });

  it("accepts the configured secret", () => {
    process.env.STUDIO_BETA_OPERATOR_SECRET = "expected-secret";

    expect(() =>
      assertStudioBetaOperatorSecret("expected-secret"),
    ).not.toThrow();
  });
});
