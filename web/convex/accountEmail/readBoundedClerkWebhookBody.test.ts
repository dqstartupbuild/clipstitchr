import { describe, expect, it } from "vitest";
import { readBoundedClerkWebhookBody } from "./readBoundedClerkWebhookBody";

describe("readBoundedClerkWebhookBody", () => {
  it("accepts a body at the 64 KiB boundary", async () => {
    const request = new Request("https://convex.example/webhooks/clerk", {
      body: "a".repeat(64 * 1_024),
      method: "POST",
    });

    await expect(readBoundedClerkWebhookBody(request)).resolves.toBeUndefined();
  });

  it("rejects a streamed body above 64 KiB", async () => {
    const request = new Request("https://convex.example/webhooks/clerk", {
      body: "a".repeat(64 * 1_024 + 1),
      method: "POST",
    });

    await expect(readBoundedClerkWebhookBody(request)).rejects.toThrow(
      "Webhook body is too large.",
    );
  });

  it("rejects an oversized declared body before reading", async () => {
    const request = new Request("https://convex.example/webhooks/clerk", {
      body: "{}",
      headers: { "content-length": String(64 * 1_024 + 1) },
      method: "POST",
    });

    await expect(readBoundedClerkWebhookBody(request)).rejects.toThrow(
      "Webhook body is too large.",
    );
  });
});
