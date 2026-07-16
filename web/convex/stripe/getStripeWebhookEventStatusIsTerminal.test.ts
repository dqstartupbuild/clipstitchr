import { describe, expect, it } from "vitest";
import { getStripeWebhookEventStatusIsTerminal } from "./getStripeWebhookEventStatusIsTerminal";

describe("getStripeWebhookEventStatusIsTerminal", () => {
  it.each(["ignored", "processed"])(
    "treats duplicate %s events as complete",
    (status) => {
      expect(getStripeWebhookEventStatusIsTerminal(status)).toBe(true);
    },
  );

  it.each(["failed", "processing"])(
    "allows %s events to continue",
    (status) => {
      expect(getStripeWebhookEventStatusIsTerminal(status)).toBe(false);
    },
  );
});
