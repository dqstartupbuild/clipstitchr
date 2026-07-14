import { describe, expect, it } from "vitest";
import { validateToolLeadCaptureEnvelope } from "./validateToolLeadCaptureEnvelope";

const capturedAt = Date.UTC(2026, 6, 13);
const validEnvelope = {
  capturedAt,
  clientKey: "a".repeat(64),
  confirmationExpiresAt: capturedAt + 48 * 60 * 60 * 1000,
  consentCopyVersion: "public-tools-v1",
  providerContactKey: "p".repeat(32),
  recognitionExpiresAt: capturedAt + 180 * 24 * 60 * 60 * 1000,
  recognitionTokenHash: "b".repeat(64),
  tokenDigest: "c".repeat(64),
  tokenRecordId: "t".repeat(32),
};

describe("tool lead capture envelope", () => {
  it("accepts the bounded server-generated 180-day and 48-hour envelope", () => {
    expect(() => validateToolLeadCaptureEnvelope(validEnvelope)).not.toThrow();
  });

  it("rejects spoofed hashes, expiry, and consent versions", () => {
    expect(() =>
      validateToolLeadCaptureEnvelope({
        ...validEnvelope,
        recognitionExpiresAt: capturedAt + 1,
      }),
    ).toThrow("Invalid capture time.");
    expect(() =>
      validateToolLeadCaptureEnvelope({
        ...validEnvelope,
        recognitionTokenHash: "plaintext",
      }),
    ).toThrow("Invalid recognition token.");
    expect(() =>
      validateToolLeadCaptureEnvelope({
        ...validEnvelope,
        consentCopyVersion: "invented",
      }),
    ).toThrow("Invalid consent version.");
  });
});
