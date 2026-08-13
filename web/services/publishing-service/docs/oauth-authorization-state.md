# OAuth Authorization State

The browser always receives an opaque state value and expiry time. A challenge
is returned only when the caller explicitly selects the `rfc7636-s256`
capability. Its verifier remains in Redis and is returned only to the server
after a valid single-use consume. The `none` capability creates no verifier or
challenge.

## Issue

`createOAuthAuthorizationRequestState` performs these steps:

1. Re-derive the personal or organization tenant from immutable Clerk IDs.
2. Require Instagram, Instagram Standalone, or TikTok as the provider.
3. Accept the configured ClipStitchr public origin and derive the exact callback
   URI as `/api/studio/publishing/oauth/{provider}/callback`.
4. Generate 32 random bytes for state.
5. For `rfc7636-s256` only, generate a 32-byte verifier and derive its challenge
   with SHA-256 and unpadded base64url encoding.
6. Store a versioned record under a SHA-256 digest of state using one
   `SET key value NX PX ttl` operation.

The default lifetime is five minutes. Callers may select from one to ten
minutes. State collisions are retried with fresh entropy, and storage failure
rejects authorization rather than returning an unstored state.

The configured public origin must be the parsed `STUDIO_PUBLISHING_APP_ORIGIN`.
Routes must never take it from a query parameter, form field, forwarded host,
or provider payload. Issue returns the derived redirect URI for the provider
authorization request. Consume takes the configured origin again and derives
the same URI independently.

The stored record binds all of these values:

- immutable tenant key;
- Clerk actor user ID and active organization ID, when present;
- provider;
- explicit PKCE capability;
- exact callback redirect URI;
- allowlisted post-callback return path;
- PKCE verifier and derived challenge when the capability is `rfc7636-s256`;
- issue and expiry times;
- digest of the browser state value.

## Consume

`consumeOAuthAuthorizationRequestState` validates the browser state shape and
then atomically removes its Redis record. Validation of expiry and bindings
happens after removal so a mismatched, corrupt, or expired record cannot be
retried.

The preferred Redis command is `GETDEL`. For older compatible deployments,
`RedisOAuthAuthorizationStateStore` uses `GET` only to obtain the expected
value, followed by this package's single Lua compare-and-delete operation:

```lua
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
```

The currently configured cloud deployment reported Redis 8.2.0 in a read-only
probe on 2026-08-02, so it supports the direct `GETDEL` path. The Lua path stays
in place for portable tests and older compatible deployments.

Two callbacks may read the same value, but only one Lua invocation can compare
and delete it successfully. A separate, unconditional `DEL` is not race-safe
and must never be substituted.

All Redis keys are prefixed with a validated deployment namespace. Development,
staging, and production must use different namespace values so state cannot be
consumed across deployments that share a Redis cluster or database.

The callback must provide the same signed-in Clerk actor, active organization,
provider, PKCE capability, configured public origin, and return path. Changing
organizations during the flow intentionally invalidates the state. The caller
receives the verifier only after every check succeeds and only for an RFC 7636
flow.

## Public provider mapping

The browser-visible provider set is exactly `instagram` and `tiktok`.
Instagram Standalone is preferred when configured, with Facebook Login for
Business retained only as an internal Instagram fallback. Both Instagram
runtimes use the public `/api/studio/publishing/oauth/instagram/callback` URI. Internal
runtime IDs are never placed in browser routes or integration-list responses.

The Facebook-backed callback discovers every eligible Instagram professional
account and saves between 1 and 100 unique accounts in one atomic persistence
operation. It does not select the first account silently and does not save the
Facebook user profile as a publishing destination.

## Browser callback boundary

The public callback is a Clerk-protected `GET` route. It accepts one state value
and either one authorization code or a provider denial. Unknown and duplicate
fields fail closed. Provider error descriptions are discarded.

The Next.js route sends only `{ state, code }` or `{ state, denied: true }` to
the assertion-protected publishing-service callback as a bounded internal
`POST`. The service consumes state before acting on either success or denial.
The browser then receives a fixed same-origin `303` back to the integrations
screen with only `connected`, `cancelled`, or `failed`. State, codes, tokens,
provider payloads, and thrown error text are never reflected in that redirect.

## Provider capability selection

PKCE is not inferred from the provider name. The adapter that owns a provider
flow must select one of these capabilities explicitly:

- `none`: state is protected and bound, but no generic PKCE values are created;
- `rfc7636-s256`: RFC 7636 verifier and unpadded base64url S256 challenge.

The recovered TikTok confidential web flow uses `none`. TikTok's desktop flow
uses a provider-specific hexadecimal SHA-256 challenge shape and is not the
same as RFC 7636 S256. Do not label that shape `S256` or route it through the
generic RFC capability. If a future provider adapter needs that flow, give it a
separate, tested capability instead of silently changing this contract.

## Required request ordering

For initiation:

1. authenticate with Clerk;
2. enforce `oauth.initiate` rate limits;
3. create state;
4. redirect to the provider.

For callback:

1. authenticate and resolve the expected tenant;
2. enforce `oauth.callback` rate limits;
3. atomically consume and validate state;
4. exchange the provider code, using the returned verifier only for an explicit
   `rfc7636-s256` flow;
5. encrypt tokens before persistence.

State, authorization codes, verifiers, assertions, and provider responses are
credentials and must not be logged.
