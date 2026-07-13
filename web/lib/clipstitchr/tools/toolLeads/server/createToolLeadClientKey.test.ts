import { describe, expect, it } from "vitest";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";

function createRequest(headers: HeadersInit) {
  return new Request("https://clipstitchr.test/tool-lead", { headers });
}

describe("createToolLeadClientKey", () => {
  it("uses a secret-keyed IP fingerprint without user-agent input", () => {
    const firstKey = createToolLeadClientKey(
      createRequest({
        "cf-connecting-ip": "203.0.113.10",
        "user-agent": "Browser A",
      }),
      "rate-limit-secret",
    );
    const sameIpKey = createToolLeadClientKey(
      createRequest({
        "cf-connecting-ip": "203.0.113.10",
        "user-agent": "Browser B",
      }),
      "rate-limit-secret",
    );
    const differentIpKey = createToolLeadClientKey(
      createRequest({ "cf-connecting-ip": "203.0.113.11" }),
      "rate-limit-secret",
    );

    expect(firstKey).toMatch(/^[a-f0-9]{64}$/);
    expect(sameIpKey).toBe(firstKey);
    expect(differentIpKey).not.toBe(firstKey);
  });

  it("uses valid trusted fallback headers and collapses unresolved clients", () => {
    const forwardedKey = createToolLeadClientKey(
      createRequest({
        "cf-connecting-ip": "spoofed",
        "x-forwarded-for": "198.51.100.8, 198.51.100.9",
      }),
      "rate-limit-secret",
    );
    const realIpKey = createToolLeadClientKey(
      createRequest({ "x-real-ip": "198.51.100.9" }),
      "rate-limit-secret",
    );
    const unresolvedKey = createToolLeadClientKey(
      createRequest({ "x-forwarded-for": "spoofed" }),
      "rate-limit-secret",
    );
    const missingKey = createToolLeadClientKey(
      createRequest({}),
      "rate-limit-secret",
    );

    expect(forwardedKey).toBe(realIpKey);
    expect(unresolvedKey).toBe(missingKey);
  });
});
