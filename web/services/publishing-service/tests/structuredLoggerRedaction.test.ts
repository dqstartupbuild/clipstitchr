import { describe, expect, it } from "vitest";

import type { StructuredLogRecord } from "../src/logging/StructuredLogRecord.js";
import { createStructuredLogger } from "../src/logging/createStructuredLogger.js";

describe("structured logger redaction", () => {
  it("redacts nested credentials, assertions, provider payloads, and signed URLs", () => {
    const records: StructuredLogRecord[] = [];
    const logger = createStructuredLogger(
      (record) => records.push(record),
      () => new Date("2026-08-02T12:00:00.000Z"),
    );
    const circular: Record<string, unknown> = {};
    circular["self"] = circular;

    logger.info("Publishing request accepted", {
      tenantKey: "clerk-personal:user_person_123",
      requestId: "request_1234567890",
      authorization: "Bearer browser-credential",
      nested: {
        refreshToken: "provider-refresh-token",
        state: "oauth-state-value",
        code: "oauth-authorization-code",
        mediaUrl: "https://media.invalid/object?signature=signed-value",
        providerPayload: { safeLookingKey: "still-secret" },
      },
      error: new Error("provider-token-in-error"),
      circular,
    });

    const serialized = JSON.stringify(records[0]);

    expect(records[0]).toMatchObject({
      timestamp: "2026-08-02T12:00:00.000Z",
      service: "clipstitchr-publishing-service",
      level: "info",
      fields: {
        tenantKey: "clerk-personal:user_person_123",
        requestId: "request_1234567890",
        authorization: "[REDACTED]",
        nested: {
          refreshToken: "[REDACTED]",
          state: "[REDACTED]",
          code: "[REDACTED]",
          mediaUrl: "https://media.invalid/object?[REDACTED]",
          providerPayload: "[REDACTED]",
        },
        error: { name: "Error", message: "[REDACTED]" },
        circular: { self: "[CIRCULAR]" },
      },
    });
    expect(serialized).not.toContain("browser-credential");
    expect(serialized).not.toContain("provider-refresh-token");
    expect(serialized).not.toContain("signed-value");
    expect(serialized).not.toContain("oauth-authorization-code");
    expect(serialized).not.toContain("still-secret");
    expect(serialized).not.toContain("provider-token-in-error");
  });

  it("redacts a compact credential accidentally supplied as the message", () => {
    const records: StructuredLogRecord[] = [];
    const logger = createStructuredLogger((record) => records.push(record));

    logger.warn("header.payload.signature");

    expect(records[0]?.message).toBe("[REDACTED]");
  });
});
