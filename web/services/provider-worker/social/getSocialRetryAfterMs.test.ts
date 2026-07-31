import { describe, expect, it } from "vitest";
import { getSocialRetryAfterMs } from "./getSocialRetryAfterMs";

describe("getSocialRetryAfterMs", () => {
  it("reads delay seconds and HTTP dates", () => {
    expect(getSocialRetryAfterMs("12", 0)).toBe(12_000);
    expect(
      getSocialRetryAfterMs(
        "Wed, 29 Jul 2026 14:00:30 GMT",
        Date.parse("2026-07-29T14:00:00.000Z"),
      ),
    ).toBe(30_000);
  });

  it("rejects invalid delays and caps long waits", () => {
    expect(getSocialRetryAfterMs("invalid", 0)).toBeUndefined();
    expect(getSocialRetryAfterMs("0", 0)).toBeUndefined();
    expect(getSocialRetryAfterMs("3600", 0)).toBe(10 * 60_000);
  });
});
