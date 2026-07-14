import { describe, expect, it } from "vitest";
import { getLoopsWebhookEventAt } from "./getLoopsWebhookEventAt";

describe("Loops webhook event time", () => {
  const receivedAt = Date.UTC(2026, 6, 13, 12);

  it("accepts delayed historical events after the sane epoch floor", () => {
    expect(
      getLoopsWebhookEventAt(
        Math.floor(Date.UTC(2000, 0, 1) / 1_000),
        receivedAt,
      ),
    ).toBe(Date.UTC(2000, 0, 1));
  });

  it("rejects unsafe, ancient, and implausibly future event times", () => {
    expect(getLoopsWebhookEventAt(Number.MAX_SAFE_INTEGER, receivedAt)).toBeNull();
    expect(getLoopsWebhookEventAt(1, receivedAt)).toBeNull();
    expect(
      getLoopsWebhookEventAt(
        Math.floor((receivedAt + 5 * 60 * 1_000) / 1_000) + 1,
        receivedAt,
      ),
    ).toBeNull();
  });
});
