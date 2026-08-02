import { describe, expect, it } from "vitest";
import { createPublishingMediaQuotaIdentity } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaQuotaIdentity";
import { sealPublishingMediaGatewayToken } from "@/lib/clipstitchr/publishing/media/gateway/sealPublishingMediaGatewayToken";
import { verifyPublishingMediaGatewayToken } from "@/lib/clipstitchr/publishing/media/gateway/verifyPublishingMediaGatewayToken";

const nowEpochMs = Date.UTC(2026, 7, 2, 12, 0, 0);
const secret = "token-secret-that-is-at-least-thirty-two-bytes-long";
const claims = {
  audience: "https://media.clipstitchr.test",
  checksum: "sha256:checksum",
  contentType: "video/mp4",
  etag: '"etag-1"',
  expiresAtEpochMs: nowEpochMs + 900_000,
  grantKey: "pmg_aaaaaaaaaaaaaaaaaaaaaa",
  issuedAtEpochMs: nowEpochMs,
  objectKey: "users/user_123/video-clips/clip_123/video.mp4",
  provider: "tiktok" as const,
  quotaIdentity: "pmq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  schema: 1 as const,
  sizeBytes: 8,
  versionId: "r2-version-1",
};

describe("publishing media gateway token", () => {
  it("round-trips opaque claims without exposing the object key", () => {
    const token = sealPublishingMediaGatewayToken(
      claims,
      secret,
      () => Buffer.alloc(12, 1),
    );

    expect(token.startsWith("v1.")).toBe(true);
    expect(token).not.toContain("users/");
    expect(
      verifyPublishingMediaGatewayToken(
        token,
        secret,
        claims.audience,
        nowEpochMs,
      ),
    ).toEqual(claims);
  });

  it("rejects a constant-shape signature tamper", () => {
    const token = sealPublishingMediaGatewayToken(
      claims,
      secret,
      () => Buffer.alloc(12, 2),
    );
    const replacement = token.endsWith("A") ? "B" : "A";
    const tampered = `${token.slice(0, -1)}${replacement}`;

    expect(() =>
      verifyPublishingMediaGatewayToken(
        tampered,
        secret,
        claims.audience,
        nowEpochMs,
      ),
    ).toThrow("unavailable");
  });

  it("rejects expired and foreign-audience grants", () => {
    const token = sealPublishingMediaGatewayToken(
      claims,
      secret,
      () => Buffer.alloc(12, 3),
    );

    expect(() =>
      verifyPublishingMediaGatewayToken(
        token,
        secret,
        claims.audience,
        claims.expiresAtEpochMs,
      ),
    ).toThrow("unavailable");
    expect(() =>
      verifyPublishingMediaGatewayToken(
        token,
        secret,
        "https://foreign.clipstitchr.test",
        nowEpochMs,
      ),
    ).toThrow("unavailable");
  });

  it("derives a stable non-sensitive quota identity", () => {
    const quotaSecret = "quota-secret-that-is-at-least-thirty-two-bytes-long";
    const identity = createPublishingMediaQuotaIdentity(
      "clerk-organization:org_123",
      quotaSecret,
    );

    expect(identity).toMatch(/^pmq_[A-Za-z0-9_-]{43}$/);
    expect(identity).not.toContain("org_123");
    expect(
      createPublishingMediaQuotaIdentity(
        "clerk-organization:org_123",
        quotaSecret,
      ),
    ).toBe(identity);
    expect(
      createPublishingMediaQuotaIdentity(
        "clerk-organization:org_456",
        quotaSecret,
      ),
    ).not.toBe(identity);
  });
});
