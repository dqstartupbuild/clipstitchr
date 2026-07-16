import { afterEach, describe, expect, it, vi } from "vitest";
import { assertBillingSupportOperatorSecret } from "./assertBillingSupportOperatorSecret";

describe("assertBillingSupportOperatorSecret", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when the dedicated secret is missing or wrong", () => {
    vi.stubEnv("BILLING_SUPPORT_OPERATOR_SECRET", "");
    expect(() => assertBillingSupportOperatorSecret("provided")).toThrow();

    vi.stubEnv("BILLING_SUPPORT_OPERATOR_SECRET", "expected");
    expect(() => assertBillingSupportOperatorSecret("wrong")).toThrow();
    expect(() => assertBillingSupportOperatorSecret("expected")).not.toThrow();
  });
});
