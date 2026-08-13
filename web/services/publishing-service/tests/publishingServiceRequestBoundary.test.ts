import { Readable } from "node:stream";

import { describe, expect, it } from "vitest";

import { InMemoryServiceAssertionReplayProtector } from "../src/assertions/InMemoryServiceAssertionReplayProtector.js";
import { createServiceAssertionSigningKey } from "../src/assertions/createServiceAssertionSigningKey.js";
import { issueServiceAssertion } from "../src/assertions/issueServiceAssertion.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import { authenticatePublishingServiceRequest } from "../src/server/authenticatePublishingServiceRequest.js";
import { readBoundedJsonRequestBody } from "../src/server/readBoundedJsonRequestBody.js";

const NOW_SECONDS = 1_785_600_000;
const signingKey = createServiceAssertionSigningKey(
  Buffer.alloc(32, 9).toString("base64"),
);
const identity = resolveClerkTenantIdentity({ actorUserId: "user_boundary" });

const createAssertion = (requestId: string) =>
  issueServiceAssertion({
    action: "publishing.posts.schedule",
    audience: "publishing-service",
    identity,
    issuer: "clipstitchr-web",
    nowEpochSeconds: NOW_SECONDS,
    requestId,
    signingKey,
  });

describe("publishing service request boundary", () => {
  it("authenticates an action- and request-bound assertion once", async () => {
    const requestId = "request-boundary-123";
    const assertion = createAssertion(requestId);
    const replayProtector = new InMemoryServiceAssertionReplayProtector(
      () => NOW_SECONDS * 1_000,
    );
    const input = {
      expectedAction: "publishing.posts.schedule" as const,
      expectedAudience: "publishing-service",
      expectedIssuer: "clipstitchr-web",
      headers: {
        authorization: `Bearer ${assertion}`,
        "x-clipstitchr-request-id": requestId,
      },
      nowEpochSeconds: NOW_SECONDS,
      replayProtector,
      signingKey,
    };

    await expect(authenticatePublishingServiceRequest(input)).resolves.toMatchObject({
      action: "publishing.posts.schedule",
      actorUserId: "user_boundary",
    });
    await expect(authenticatePublishingServiceRequest(input)).rejects.toMatchObject({
      status: 401,
      code: "authentication_required",
    });
  });

  it("rejects a mismatched request ID without leaking assertion detail", async () => {
    const assertion = createAssertion("request-original-123");

    await expect(
      authenticatePublishingServiceRequest({
        expectedAction: "publishing.posts.schedule",
        expectedAudience: "publishing-service",
        expectedIssuer: "clipstitchr-web",
        headers: {
          authorization: `Bearer ${assertion}`,
          "x-clipstitchr-request-id": "request-changed-123",
        },
        nowEpochSeconds: NOW_SECONDS,
        replayProtector: new InMemoryServiceAssertionReplayProtector(
          () => NOW_SECONDS * 1_000,
        ),
        signingKey,
      }),
    ).rejects.toMatchObject({ status: 401, code: "authentication_required" });
  });

  it("reads bounded JSON with or without a declared length", async () => {
    const body = JSON.stringify({ caption: "A finished clip" });

    await expect(
      readBoundedJsonRequestBody({
        headers: { "content-type": "application/json; charset=utf-8" },
        body: Readable.from([body]),
      }),
    ).resolves.toEqual({ caption: "A finished clip" });
  });

  it("rejects unsupported content, declared overflow, streamed overflow, and invalid JSON", async () => {
    const cases = [
      readBoundedJsonRequestBody({
        headers: { "content-type": "text/plain" },
        body: Readable.from(["{}"]),
      }),
      readBoundedJsonRequestBody(
        {
          headers: { "content-type": "application/json", "content-length": "9" },
          body: Readable.from(["{}"]),
        },
        8,
      ),
      readBoundedJsonRequestBody(
        {
          headers: { "content-type": "application/json" },
          body: Readable.from(["{\"too\":\"large\"}"]),
        },
        8,
      ),
      readBoundedJsonRequestBody({
        headers: { "content-type": "application/json" },
        body: Readable.from(["{"]),
      }),
    ];

    const errors = await Promise.allSettled(cases);

    expect(errors.map((result) => result.status)).toEqual([
      "rejected",
      "rejected",
      "rejected",
      "rejected",
    ]);
  });
});
