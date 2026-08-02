# Social Account OAuth and Token Lifecycle

## Connection

Settings starts a server-owned OAuth flow for TikTok or Instagram. The start
route is paid-entitlement protected and rate-limited. It stores a hashed,
owner-bound, platform-bound state for ten minutes with the exact redirect URI
and a safe dashboard return path. A callback can consume that state once.

TikTok and Instagram secrets stay in the Next.js server and provider worker.
Tokens never enter browser responses, job snapshots, analytics records, or
logs. Provider error bodies are recursively sanitized before they are stored,
so token-like keys and credential-shaped strings become `[REDACTED]`.
Connected rows expose only account identity, status, scopes, and posting
capabilities.

Instagram's authorization-code exchange is sent as multipart form data, as
required by its token endpoint. TikTok's initial profile lookup requests only
`open_id`, avatar, and display name because those fields are covered by
`user.info.basic`; it does not request the separately protected `username`
field.

The callback records a `social_oauth_callback_failed` server log with the
platform, failed stage, and error type only. It never records the authorization
code, state, access token, refresh token, error message, or raw provider
response. Settings reads the callback result and shows a success, cancel,
expired-link, provider-exchange, or secure-save message beside the connection
controls instead of failing silently.

### PKCE applicability

ClipStitchr uses the providers' server-side web authorization flows. TikTok's
current OAuth token contract requires `code_verifier` for mobile and desktop
clients, but not for Web clients that authenticate the token exchange with a
server-held client secret. TikTok Web therefore uses the short-lived,
owner-bound, one-time state record described above without PKCE.

Meta's current Instagram Login web flow does not publish a
`code_challenge`/`code_verifier` contract. ClipStitchr must not add unsupported
authorization parameters. If either provider adds PKCE to its Web contract,
store the encrypted verifier in the existing OAuth-state record and send it
only during the matching code exchange.

Instagram connections accept professional Business and Creator accounts only.
Unsupported account types return plain guidance instead of saving a token.

## Encryption and refresh

Tokens use AES-256-GCM with a random 12-byte IV and authentication tag. The
versioned key ring is JSON in `SOCIAL_TOKEN_ENCRYPTION_KEYS`; the write version
is `SOCIAL_TOKEN_ENCRYPTION_CURRENT_VERSION`. Both runtimes need the same
server-only values.

The provider worker takes a two-minute Convex refresh lock before refreshing an
expiring token. A second worker stops instead of overwriting it. A failed
provider refresh releases its own lock immediately; the two-minute lease is the
fallback if that cleanup cannot reach Convex. TikTok's returned access token and
rotated refresh token are encrypted and committed together under the same lock.
Instagram long-lived access tokens are refreshed and re-encrypted in the same
guarded path.

## Disconnect, revocation, and deletion

Disconnect is owner-authorized and separately rate-limited. ClipStitchr tries
the provider revocation endpoint, redacts stored credentials, marks the account
disconnected, removes product defaults, and holds future deliveries. It never
deletes the user's schedule.

Signed TikTok and Instagram webhooks have replay records. Instagram
deauthorization and data-deletion callbacks both verify Meta's signed request,
and every signed social callback is read through a streamed 64 KiB body cap.
The callbacks have separate effects. Deauthorization revokes the saved
connection, removes product defaults, and holds future work without deleting
history. A data-deletion request also removes provider publication and analytics
records, redacts remaining account history, and returns the required
confirmation status URL.

If the same provider account is connected by more than one ClipStitchr owner,
a provider deauthorization event revokes each matching local connection.
Defaults, held deliveries, and reconnect notices remain isolated to each owner.
The provider's signed data-deletion request likewise removes provider-derived
records from every matching local connection instead of choosing one owner.

Relevant code:

```text
web/lib/clipstitchr/server/social/
web/convex/socialOAuth/
web/convex/socialAccounts/
web/app/api/social/oauth/
web/app/api/social/webhooks/
web/app/api/social/deauthorize/
web/app/api/social/data-deletion/
```

See the official [TikTok OAuth token-management reference](https://developers.tiktok.com/doc/oauth-user-access-token-management)
and [Meta Instagram API collection](https://www.postman.com/meta/instagram/overview).
