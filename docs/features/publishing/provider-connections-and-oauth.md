# Publishing Provider Connections and OAuth

ClipStitchr exposes one Instagram connection experience and one TikTok
connection experience inside the authenticated publishing workspace. The
browser stays on the ClipStitchr domain. It never receives publishing-service
credentials, provider tokens, refresh tokens, or raw provider errors.

This capability covers listing connections, starting authorization, completing
OAuth, refreshing credentials, disconnecting an account, and reading TikTok
creator settings. Publishing, scheduling, media preparation, analytics, and
background reconciliation are separate capabilities.

## Supported providers

The public provider set is exactly `instagram` and `tiktok`.

Instagram Standalone is preferred when its runtime is configured. The Facebook
Login for Business runtime remains an internal Instagram fallback for eligible
business and creator accounts. It is not exposed as a separate public provider.
When that fallback discovers multiple eligible Instagram accounts, ClipStitchr
saves all of them in one atomic batch. The Facebook user profile is never saved
as a publishing destination.

TikTok uses the retained confidential web OAuth flow and exposes creator-info
requirements only for a tenant-owned TikTok connection.

YouTube and every other social provider remain unavailable through this API.

## Browser API

Every route authenticates with Clerk before calling the internal publishing
service.

| Method | ClipStitchr route | Purpose |
| --- | --- | --- |
| `GET` | `/api/publishing/integrations` | List Instagram and TikTok availability and safe connection metadata. |
| `POST` | `/api/publishing/integrations/{provider}/connect` | Start authorization for `instagram` or `tiktok`. |
| `GET` | `/api/publishing/oauth/{provider}/callback` | Consume the provider callback and return to the integrations screen. |
| `POST` | `/api/publishing/integrations/{integrationId}/refresh` | Refresh a tenant-owned connection when supported. |
| `DELETE` | `/api/publishing/integrations/{integrationId}` | Disconnect a tenant-owned connection. |
| `GET` | `/api/publishing/integrations/tiktok/creator-info?integrationId={id}` | Read current TikTok posting requirements. |

The connect body must be exactly:

```json
{
  "returnPath": "/dashboard/publishing/integrations"
}
```

The OAuth callback accepts one `state` and either one `code` or the provider's
denial marker. Duplicate or unknown query fields fail closed. ClipStitchr sends
only `{ state, code }` or `{ state, denied: true }` to the internal service. It
then issues a fixed same-origin `303` redirect with only one of these results:

- `connection=connected`
- `connection=cancelled`
- `connection=failed`

Authorization codes, state, provider descriptions, tokens, and thrown error
text are never copied into the redirect URL or body. Callback responses use
`Referrer-Policy: no-referrer` and `Cache-Control: no-store`.

## Internal service API

`createPublishingIntegrationRoutes` creates the assertion-protected service
routes. The browser cannot call these routes with a reusable service key.

| Method | Publishing-service route | Assertion action | Rate-limit action |
| --- | --- | --- | --- |
| `GET` | `/v1/integrations` | `publishing.integrations.read` | `integration.read` |
| `POST` | `/v1/integrations/{provider}/connect` | `publishing.integrations.connect` | `oauth.initiate` |
| `POST` | `/v1/integrations/{provider}/callback` | `publishing.integrations.callback` | `oauth.callback` |
| `POST` | `/v1/integrations/{integrationId}/refresh` | `publishing.integrations.refresh` | `integration.refresh` |
| `DELETE` | `/v1/integrations/{integrationId}` | `publishing.integrations.disconnect` | `integration.disconnect` |
| `GET` | `/v1/integrations/tiktok/creator-info` | `publishing.status.poll` | `status.poll` |

Connect bodies are limited to 1 KiB. Callback bodies are limited to 4 KiB. The
browser refresh and disconnect proxies reject request bodies, and creator-info
accepts exactly one bounded `integrationId` query value. The corresponding
service routes declare that they do not consume bodies. The shared service
router also caps the internal request URL.

## Authorization and state lifecycle

The Next.js proxy resolves the current Clerk user and active organization on
the server. `requestPublishingService` issues a short-lived assertion that
binds the action, tenant, actor, organization, and request ID. The publishing
service matches that action to the selected method and path, then verifies the
assertion and its replay protection before running the route.

OAuth state is random, opaque, stored in Redis, and single use. It binds:

- the immutable personal or organization tenant key;
- the Clerk actor and active organization;
- the selected internal provider runtime;
- the exact ClipStitchr callback URI;
- the allowlisted integrations return path;
- the issue and expiration times.

The callback atomically removes state before handling a provider denial or
exchanging an authorization code. Invalid, mismatched, expired, or replayed
state cannot be tried again. Instagram Standalone still returns through the
public `/api/publishing/oauth/instagram/callback` route.

## Persistence and refresh behavior

`createPrismaPublishingIntegrationConnectionStore` joins the route layer to
the publishing persistence API.

- Provider tokens are encrypted before PostgreSQL persistence.
- A multi-account Instagram callback saves between 1 and 100 unique accounts
  in one transaction, with stable advisory-lock ordering and no partial save.
- List responses include only safe display metadata. Internal provider IDs,
  credential payloads, token-like profile values, and unsafe avatar URLs are
  excluded.
- Every refresh, disconnect, and creator-info read proves tenant ownership
  independently of rate limiting.
- Instagram Standalone refreshes its long-lived access token.
- TikTok rotates access and refresh credentials through its refresh token.
- Facebook-backed Instagram connections require reconnect when their current
  credential cannot be refreshed safely by this flow.
- Disconnect uses one atomic operation to disable the connection, revoke its
  stored secret, and append the audit event.

## Failure behavior

Missing provider configuration returns an unavailable provider without making
a provider request. Provider rate limits return `429` with a validated retry
delay. Storage and configuration failures fail closed. Unknown errors return a
generic message, and provider response bodies or credentials are never used as
public error text.

## File tree

```text
web/
├── app/api/publishing/
│   ├── integrations/
│   │   ├── [integrationId]/connect/route.ts
│   │   ├── [integrationId]/refresh/route.ts
│   │   ├── [integrationId]/route.ts
│   │   ├── tiktok/creator-info/route.ts
│   │   └── route.ts
│   └── oauth/[provider]/callback/route.ts
├── lib/clipstitchr/publishing/service/
│   ├── requestPublishingService.ts
│   ├── requirePublishingProxyAuthentication.ts
│   ├── readPublishingOAuthCallbackQuery.ts
│   └── createPublishingOAuthRedirectResponse.ts
└── services/publishing-service/src/
    ├── integrations/
    │   ├── createPublishingIntegrationRoutes.ts
    │   ├── createPrismaPublishingIntegrationConnectionStore.ts
    │   └── create*PublishingIntegrationRoute.ts
    ├── oauth/
    ├── persistence/
    ├── provider-runtime/instagram/
    └── provider-runtime/tiktok/
```

The dynamic Next.js directory uses `[integrationId]` so it can share refresh
and disconnect routes without introducing two conflicting dynamic segment
names. Only the connect child interprets that segment as a public provider.

## Tests and verification

`web/services/publishing-service/tests/publishingIntegrationRoutes.test.ts`
covers public-provider mapping, redaction, standalone preference, disabled
providers, atomic Facebook account discovery, state replay and binding, tenant
ownership, single-use provider denials, and unknown-error redaction through a
real in-memory HTTP server.

`web/app/api/publishing/integrations/publishingIntegrationApiRoutes.test.ts`
covers Clerk protection, assertion actions, body and query bounds, callback
redirect safety, provider denials, duplicate fields, and secret redaction.

Run:

```bash
cd web
npx tsc --noEmit
npx vitest run app/api/publishing/integrations/publishingIntegrationApiRoutes.test.ts
npm run typecheck --workspace @clipstitchr/publishing-service
npm test --workspace @clipstitchr/publishing-service -- \
  tests/publishingIntegrationRoutes.test.ts
```

These tests use fake provider runtimes. They do not authorize a real provider,
write cloud credentials, deploy services, or modify a Convex deployment. Live
OAuth validation is a separate production-readiness step after reviewed Meta,
TikTok, Redis, PostgreSQL, Clerk, origin, and token-cipher configuration exists.

## Related references

- `docs/architecture/postiz-publishing-source-boundary.md`
- `docs/features/publishing/postiz-provider-adapter-audit.md`
- `docs/features/publishing/publishing-persistence-model.md`
- `web/services/publishing-service/docs/oauth-authorization-state.md`
- `web/services/publishing-service/docs/rate-limits.md`
- `docs/operations/security/rate-limits.md`
