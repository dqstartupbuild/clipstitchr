import { describe, expect, it } from "vitest";
import { getUsageReservationExpiry } from "./getUsageReservationExpiry";

describe("getUsageReservationExpiry", () => {
  it("uses a short reservation window for synchronous server work", () => {
    expect(
      getUsageReservationExpiry("2026-07-22T12:00:00.000Z", "server"),
    ).toBe("2026-07-22T14:00:00.000Z");
  });

  it("keeps the longer recovery window for queued worker work", () => {
    expect(
      getUsageReservationExpiry("2026-07-22T12:00:00.000Z", "worker"),
    ).toBe("2026-07-23T12:00:00.000Z");
  });
});
