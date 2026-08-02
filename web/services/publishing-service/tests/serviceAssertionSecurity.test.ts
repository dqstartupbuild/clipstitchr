import { describe, expect, it } from "vitest";

import { InMemoryServiceAssertionReplayProtector } from "../src/assertions/InMemoryServiceAssertionReplayProtector.js";
import { createServiceAssertionSigningKey } from "../src/assertions/createServiceAssertionSigningKey.js";
import { issueServiceAssertion } from "../src/assertions/issueServiceAssertion.js";
import { verifyServiceAssertion } from "../src/assertions/verifyServiceAssertion.js";
import { decodeBase64UrlJson } from "../src/crypto/decodeBase64UrlJson.js";
import { InvalidServiceAssertionError } from "../src/errors/InvalidServiceAssertionError.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";

const NOW = 1_785_600_000;
const REQUEST_ID = "request_1234567890";
const ISSUER = "clipstitchr-web";
const AUDIENCE = "clipstitchr-publishing-service";

const createAssertion = () => {
  const signingKey = createServiceAssertionSigningKey(
    Buffer.alloc(32, 11).toString("base64"),
  );
  const assertion = issueServiceAssertion({
    issuer: ISSUER,
    audience: AUDIENCE,
    action: "publishing.posts.publish",
    requestId: REQUEST_ID,
    identity: resolveClerkTenantIdentity({
      actorUserId: "user_publisher_123",
      activeOrganizationId: "org_brand_456",
    }),
    signingKey,
    nowEpochSeconds: NOW,
  });

  return { assertion, signingKey };
};

const createReplayProtector = () =>
  new InMemoryServiceAssertionReplayProtector(() => NOW * 1_000);

describe("service assertion security", () => {
  it("issues the documented versioned compact header and verifies all bindings", async () => {
    const { assertion, signingKey } = createAssertion();
    const [encodedHeader] = assertion.split(".");

    expect(decodeBase64UrlJson(encodedHeader ?? "")).toEqual({
      alg: "HS256",
      typ: "CS-SA",
      v: 1,
    });

    await expect(
      verifyServiceAssertion({
        assertion,
        expectedIssuer: ISSUER,
        expectedAudience: AUDIENCE,
        expectedAction: "publishing.posts.publish",
        expectedRequestId: REQUEST_ID,
        signingKey,
        replayProtector: createReplayProtector(),
        nowEpochSeconds: NOW,
      }),
    ).resolves.toMatchObject({
      tenantKey: "clerk-organization:org_brand_456",
      actorUserId: "user_publisher_123",
      actorOrganizationId: "org_brand_456",
      nonce: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/),
      issuedAt: NOW,
      expiresAt: NOW + 60,
    });
  });

  it.each([
    ["expectedAudience", "another-service"],
    ["expectedAction", "publishing.posts.cancel"],
    ["expectedRequestId", "different_123456789"],
  ] as const)("rejects a mismatched %s binding", async (field, value) => {
    const { assertion, signingKey } = createAssertion();
    const verification = {
      assertion,
      expectedIssuer: ISSUER,
      expectedAudience: AUDIENCE,
      expectedAction: "publishing.posts.publish" as const,
      expectedRequestId: REQUEST_ID,
      signingKey,
      replayProtector: createReplayProtector(),
      nowEpochSeconds: NOW,
      [field]: value,
    };

    await expect(verifyServiceAssertion(verification)).rejects.toMatchObject({
      reason: "binding",
    });
  });

  it("rejects tampering before reading untrusted claims", async () => {
    const { assertion, signingKey } = createAssertion();
    const segments = assertion.split(".");
    const encodedClaims = segments[1] ?? "";
    const replacement = encodedClaims.endsWith("A") ? "B" : "A";
    segments[1] = `${encodedClaims.slice(0, -1)}${replacement}`;

    await expect(
      verifyServiceAssertion({
        assertion: segments.join("."),
        expectedIssuer: ISSUER,
        expectedAudience: AUDIENCE,
        expectedAction: "publishing.posts.publish",
        expectedRequestId: REQUEST_ID,
        signingKey,
        replayProtector: createReplayProtector(),
        nowEpochSeconds: NOW,
      }),
    ).rejects.toMatchObject({ reason: "signature" });
  });

  it("rejects expired assertions", async () => {
    const { assertion, signingKey } = createAssertion();

    await expect(
      verifyServiceAssertion({
        assertion,
        expectedIssuer: ISSUER,
        expectedAudience: AUDIENCE,
        expectedAction: "publishing.posts.publish",
        expectedRequestId: REQUEST_ID,
        signingKey,
        replayProtector: new InMemoryServiceAssertionReplayProtector(
          () => (NOW + 60) * 1_000,
        ),
        nowEpochSeconds: NOW + 60,
      }),
    ).rejects.toMatchObject({ reason: "expired" });
  });

  it("atomically permits only one use of an assertion", async () => {
    const { assertion, signingKey } = createAssertion();
    const replayProtector = createReplayProtector();
    const verification = {
      assertion,
      expectedIssuer: ISSUER,
      expectedAudience: AUDIENCE,
      expectedAction: "publishing.posts.publish" as const,
      expectedRequestId: REQUEST_ID,
      signingKey,
      replayProtector,
      nowEpochSeconds: NOW,
    };
    const results = await Promise.allSettled([
      verifyServiceAssertion(verification),
      verifyServiceAssertion(verification),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(({ status }) => status === "rejected");
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: expect.objectContaining({ reason: "replayed" }),
    });
  });

  it("uses a fresh nonce for every assertion", () => {
    const first = createAssertion().assertion;
    const second = createAssertion().assertion;

    expect(first).not.toBe(second);
  });

  it("will not issue an assertion beyond the maximum short lifetime", () => {
    const signingKey = createServiceAssertionSigningKey(
      Buffer.alloc(32, 11).toString("base64"),
    );

    expect(() =>
      issueServiceAssertion({
        issuer: ISSUER,
        audience: AUDIENCE,
        action: "publishing.posts.publish",
        requestId: REQUEST_ID,
        identity: resolveClerkTenantIdentity({ actorUserId: "user_person_123" }),
        signingKey,
        ttlSeconds: 121,
        nowEpochSeconds: NOW,
      }),
    ).toThrow(InvalidServiceAssertionError);
  });
});
