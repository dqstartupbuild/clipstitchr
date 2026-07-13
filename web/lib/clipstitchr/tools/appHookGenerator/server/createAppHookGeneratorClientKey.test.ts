import { describe, expect, it } from "vitest";
import { createAppHookGeneratorClientKey } from "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorClientKey";

describe("createAppHookGeneratorClientKey", () => {
  it("creates a stable hash without retaining the client address", () => {
    const request = new Request("https://clipstitchr.test", {
      headers: {
        "user-agent": "Test Browser",
        "x-forwarded-for": "192.0.2.10, 198.51.100.5",
      },
    });
    const key = createAppHookGeneratorClientKey(request);

    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain("192.0.2.10");
    expect(createAppHookGeneratorClientKey(request)).toBe(key);
  });

  it("does not let user-agent changes create fresh client quota", () => {
    const first = new Request("https://clipstitchr.test", {
      headers: {
        "user-agent": "Browser A",
        "x-forwarded-for": "192.0.2.10",
      },
    });
    const second = new Request("https://clipstitchr.test", {
      headers: {
        "user-agent": "Browser B",
        "x-forwarded-for": "192.0.2.10",
      },
    });

    expect(createAppHookGeneratorClientKey(first)).toBe(
      createAppHookGeneratorClientKey(second),
    );
  });

  it("uses trusted address headers before the forwarded chain", () => {
    const first = new Request("https://clipstitchr.test", {
      headers: {
        "cf-connecting-ip": "203.0.113.8",
        "x-forwarded-for": "192.0.2.1, 198.51.100.4",
      },
    });
    const second = new Request("https://clipstitchr.test", {
      headers: {
        "cf-connecting-ip": "203.0.113.8",
        "x-forwarded-for": "192.0.2.99, 198.51.100.9",
      },
    });

    expect(createAppHookGeneratorClientKey(first)).toBe(
      createAppHookGeneratorClientKey(second),
    );
  });

  it("ignores a spoofed first forwarded address", () => {
    const first = new Request("https://clipstitchr.test", {
      headers: { "x-forwarded-for": "192.0.2.1, 198.51.100.4" },
    });
    const second = new Request("https://clipstitchr.test", {
      headers: { "x-forwarded-for": "203.0.113.9, 198.51.100.4" },
    });

    expect(createAppHookGeneratorClientKey(first)).toBe(
      createAppHookGeneratorClientKey(second),
    );
  });
});
