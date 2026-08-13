# Service Assertion Wire Format

ClipStitchr's web gateway and private publishing service exchange a compact,
versioned, dependency-free HMAC assertion. Its wire form is:

```text
base64url(header).base64url(payload).base64url(HMAC-SHA256(first-two-segments))
```

The header is exactly:

```json
{"alg":"HS256","typ":"CS-SA","v":1}
```

The payload uses the public `ServiceAssertionClaims` shape:

```json
{
  "version": 1,
  "issuer": "clipstitchr-web",
  "audience": "clipstitchr-publishing-service",
  "tenantKey": "clerk-organization:org_example",
  "actorUserId": "user_example",
  "actorOrganizationId": "org_example",
  "action": "publishing.posts.publish",
  "requestId": "request_opaque_identifier",
  "nonce": "32-base64url-characters",
  "issuedAt": 1785600000,
  "expiresAt": 1785600060
}
```

`actorOrganizationId` is omitted for a personal tenant. A personal tenant key
must equal `clerk-personal:${actorUserId}`. An organization tenant key must
equal `clerk-organization:${actorOrganizationId}`. The verifier derives that
relationship again rather than trusting the signed key as an arbitrary string.

The issuer creates a cryptographically random 24-byte nonce, uses a 60-second
default lifetime, and cannot issue a lifetime longer than 120 seconds. The
verifier checks the exact expected issuer, audience, action, and request ID,
rejects future or expired assertions, and atomically consumes a hash of the
issuer plus nonce until expiry. A second use is rejected.

Production consumption uses `RedisServiceAssertionReplayProtector`, which
stores a namespaced replay marker with one `SET NX PX` command. Every deployment
uses a distinct validated Redis namespace so assertions cannot share replay
state across development, staging, or production.

Both sides use the same independently generated 32-byte HMAC key. That key is
not the provider-token encryption key. Assertions are credentials: they must
not be returned to browser JavaScript, persisted, or logged.

Gateway modules should import the issuer and types from:

- `src/assertions/issueServiceAssertion.ts`
- `src/assertions/ServiceAssertionIssueInput.ts`
- `src/assertions/ServiceAssertionAction.ts`
- `src/assertions/ServiceAssertionClaims.ts`
- `src/identity/resolveClerkTenantIdentity.ts`

Publishing-service middleware should import the verifier from
`src/assertions/verifyServiceAssertion.ts` and provide a production Redis-backed
`ServiceAssertionReplayProtector` implementation.
