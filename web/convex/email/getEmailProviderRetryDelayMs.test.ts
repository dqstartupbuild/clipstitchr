import { describe, expect, it } from "vitest";
import { getEmailProviderRetryDelayMs } from "./getEmailProviderRetryDelayMs";

describe("email provider retry delay", () => {
  it("uses bounded exponential backoff", () => {
    expect(getEmailProviderRetryDelayMs(1)).toBe(15_000);
    expect(getEmailProviderRetryDelayMs(2)).toBe(30_000);
    expect(getEmailProviderRetryDelayMs(7)).toBe(16 * 60_000);
    expect(getEmailProviderRetryDelayMs(100)).toBe(16 * 60_000);
  });
});
