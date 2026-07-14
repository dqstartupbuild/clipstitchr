import { describe, expect, it } from "vitest";
import { createEmailConfirmationClientKey } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationClientKey";

describe("createEmailConfirmationClientKey", () => {
  it("creates a secret-keyed client fingerprint without browser details", () => {
    const createRequest = (ip: string, userAgent: string) =>
      new Request("https://clipstitchr.com/email/confirm", {
        headers: {
          "cf-connecting-ip": ip,
          "user-agent": userAgent,
        },
      });
    const first = createEmailConfirmationClientKey(
      createRequest("203.0.113.10", "Browser A"),
      "secret",
    );
    const sameClient = createEmailConfirmationClientKey(
      createRequest("203.0.113.10", "Browser B"),
      "secret",
    );
    const otherClient = createEmailConfirmationClientKey(
      createRequest("203.0.113.11", "Browser A"),
      "secret",
    );

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(sameClient).toBe(first);
    expect(otherClient).not.toBe(first);
  });
});
