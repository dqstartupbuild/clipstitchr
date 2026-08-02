# Publishing Rate Limits

`RedisPublishingRateLimiter` checks the global and tenant quotas in one Redis
Lua invocation. Both keys use the same Redis Cluster hash tag. Tenant keys are
SHA-256 digests, so immutable Clerk IDs do not appear in Redis keys.
The validated deployment namespace is part of that hash tag, which keeps
development, staging, and production counters independent on shared Redis
infrastructure.

The script obtains time from Redis, inspects both fixed-window counters, and
updates both or neither. It uses `HSET` and `PEXPIREAT` only when every scope
has capacity. A tenant denial therefore does not consume the global quota, and
a global denial does not consume the tenant quota.

The included starting policies cover every current service action:

| Action | Tenant limit | Global limit | Window |
| --- | ---: | ---: | ---: |
| Integration read | 120 | 10,000 | 1 minute |
| OAuth initiation | 10 | 1,000 | 10 minutes |
| OAuth callback | 30 | 3,000 | 10 minutes |
| Integration refresh | 30 | 2,000 | 1 hour |
| Integration disconnect | 10 | 1,000 | 1 hour |
| Media registration | 60 | 5,000 | 1 hour |
| Media fetch URL | 240 | 20,000 | 1 hour |
| Draft write | 120 | 10,000 | 1 hour |
| Publish creation | 20 | 1,000 | 1 hour |
| Schedule creation | 100 | 10,000 | 1 hour |
| Publish retry | 30 | 2,000 | 1 hour |
| Publish cancellation | 60 | 5,000 | 1 hour |
| Analytics refresh | 12 | 200 | 1 hour |
| Status poll | 600 | 10,000 | 1 minute |
| Paid provider work | 20 | 500 | 1 minute |

These values are an explicit baseline, not proof of production capacity. They
must be reconciled with provider quotas, deployment size, abuse observations,
and `docs/operations/security/rate-limits.md` before release.

`enforcePublishingRateLimit` converts a denial into
`PublishingRateLimitExceededError`. HTTP gateways should map it to status 429,
use `retryAfterSeconds` for the `Retry-After` header, and show a short human
message. Storage failures raise `PublishingRateLimitStorageError` and deny the
request. They must never fall back to an unprotected provider call.

Call the gate before the protected side effect:

- before storing OAuth initiation state;
- before consuming callback state or exchanging a code;
- before reading, refreshing, or disconnecting an integration;
- before creating provider work, signing media URLs, starting workflows, or
  making paid third-party calls.

For work with multiple provider destinations, pass a `cost` matching the
number of protected units. The cost must fit both configured quotas.

The disposable Redis integration suite verifies real `SET NX PX`, `GETDEL`, the
compare-and-delete Lua fallback, namespace isolation, and dual-scope rate-limit
behavior. Production verification still requires a readiness smoke check
against the deployed Redis version, Cluster behavior when Cluster is used, and
HTTP 429 response mapping.
