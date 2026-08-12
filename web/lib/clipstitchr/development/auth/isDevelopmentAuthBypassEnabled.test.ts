import { describe, expect, it } from "vitest";
import { isDevelopmentAuthBypassEnabled } from "@/lib/clipstitchr/development/auth/isDevelopmentAuthBypassEnabled";

describe("isDevelopmentAuthBypassEnabled", () => {
  it("activates for an explicit development loopback request", () => {
    expect(
      isDevelopmentAuthBypassEnabled({
        enabledValue: "true",
        hostname: "localhost:3000",
        nodeEnv: "development",
      }),
    ).toBe(true);
    expect(
      isDevelopmentAuthBypassEnabled({
        enabledValue: "true",
        hostname: "127.0.0.2",
        nodeEnv: "development",
      }),
    ).toBe(true);
    expect(
      isDevelopmentAuthBypassEnabled({
        enabledValue: "true",
        hostname: "[::1]:3000",
        nodeEnv: "development",
      }),
    ).toBe(true);
  });

  it("fails closed in production even when explicitly enabled", () => {
    expect(
      isDevelopmentAuthBypassEnabled({
        enabledValue: "true",
        hostname: "localhost",
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("rejects preview hosts, remote hosts, and lookalike localhost names", () => {
    for (const hostname of [
      "preview.clipstitchr.com",
      "192.168.1.20",
      "localhost.example.com",
      "0.0.0.0",
      "127.999.1.1",
    ]) {
      expect(
        isDevelopmentAuthBypassEnabled({
          enabledValue: "true",
          hostname,
          nodeEnv: "development",
        }),
      ).toBe(false);
    }
  });

  it("requires the exact opt-in value", () => {
    expect(
      isDevelopmentAuthBypassEnabled({
        enabledValue: "false",
        hostname: "localhost",
        nodeEnv: "development",
      }),
    ).toBe(false);
    expect(
      isDevelopmentAuthBypassEnabled({
        hostname: "localhost",
        nodeEnv: "development",
      }),
    ).toBe(false);
  });
});
