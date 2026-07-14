import { describe, expect, it } from "vitest";
import { readBoundedWebhookBody } from "@/lib/clipstitchr/email/webhooks/readBoundedWebhookBody";

describe("readBoundedWebhookBody", () => {
  it("returns the exact raw UTF-8 body", async () => {
    const body = '{"message":"exact spacing stays here"}\n';
    const request = new Request("https://example.com/webhooks/loops", {
      body,
      method: "POST",
    });

    await expect(readBoundedWebhookBody(request)).resolves.toBe(body);
  });

  it("rejects a body over 64 KiB", async () => {
    const request = new Request("https://example.com/webhooks/loops", {
      body: "a".repeat(64 * 1_024 + 1),
      method: "POST",
    });

    await expect(readBoundedWebhookBody(request)).rejects.toThrow(
      "Webhook body is too large.",
    );
  });
});
