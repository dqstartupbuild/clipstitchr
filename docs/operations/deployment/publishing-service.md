# Publishing service deployment

## Launch state

The publishing service is a long-running Cloud Run service with an embedded
PostgreSQL outbox dispatcher. It is not a Cloud Run Job. The production deploy
is blocked until the provider, media-domain, migration, and authorized-account
gates in this runbook pass. This document does not record a production deploy
or a verified live post.

The separate migration command may run as a one-task Cloud Run Job. Running the
HTTP service itself as a job would strand scheduled work and status polling.

## Runtime topology

```text
Clerk-authenticated ClipStitchr web routes
  -> short-lived HMAC service assertion
  -> Cloud Run publishing service
       -> PostgreSQL core, sidecars, receipts, and transactional outbox
       -> Redis replay protection, OAuth state, webhook replay, and rate limits
       -> private Cloudflare R2 plus the verified publishing media gateway
       -> Instagram and TikTok APIs

TikTok webhook
  -> public /v1/webhooks/tiktok route
  -> raw-body signature, age, replay, client-key, and rate-limit checks
  -> outbox nudge only
```

Every other `/v1` operation requires a replay-protected service assertion. The
public health endpoints contain no tenant or provider data.

## Production blockers recorded on 2026-08-02

- Meta app credentials are not present in Secret Manager, so the required
  Instagram path cannot pass fail-closed startup validation.
- TikTok still needs the applicable Content Posting API approval and an
  authorized production test account.
- `TIKTOK_VERIFIED_MEDIA_ORIGIN` must be the exact provider-verified HTTPS
  origin used by `PUBLISHING_MEDIA_PUBLIC_ORIGIN`.
- The additive migrations have passed disposable PostgreSQL 18 tests, but they
  have not been applied to production or proven through a production restore.
- Post Bridge still has unresolved scheduled and processing records. This
  deployment does not authorize disabling or deleting Post Bridge.

Resolve these gates before creating a traffic-serving revision.

## Build the image

Run from `web/` with the repository's committed lockfile:

```bash
PROJECT_ID=clipstitchr
REGION=us-central1
TAG="publishing-$(git rev-parse --short HEAD)"
REPOSITORY="$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr"
IMAGE="$REPOSITORY/publishing-service:$TAG"

docker build --platform linux/amd64 \
  -f services/publishing-service/Dockerfile \
  -t "$IMAGE" \
  .

docker push "$IMAGE"
```

Record the immutable image digest. Do not promote a tag alone.

## Environment contract

Use plain environment values only for non-secret configuration:

```text
NODE_ENV=production
PUBLISHING_SERVICE_HOST=0.0.0.0
PORT=8080
PUBLISHING_SERVICE_ISSUER=clipstitchr-web-production
PUBLISHING_SERVICE_AUDIENCE=clipstitchr-publishing-production
PUBLISHING_TOKEN_KEY_ID=v1
PUBLISHING_REDIS_NAMESPACE=clipstitchr-production
CLIPSTITCHR_PUBLIC_ORIGIN=https://your-production-clipstitchr-origin.example
PUBLISHING_ENABLED_PROVIDERS=instagram,tiktok
META_GRAPH_API_VERSION=<explicit supported vNN.N value>
FACEBOOK_APP_ID=<Meta app id>
TIKTOK_CLIENT_ID=<TikTok client key>
TIKTOK_VERIFIED_MEDIA_ORIGIN=https://your-provider-verified-media-origin.example
R2_ACCOUNT_ID=<Cloudflare account id>
R2_BUCKET_NAME=<private bucket name>
PUBLISHING_MEDIA_PUBLIC_ORIGIN=https://your-provider-verified-media-origin.example
PUBLISHING_OUTBOX_POLL_MS=1000
PUBLISHING_OUTBOX_LEASE_MS=120000
PUBLISHING_OUTBOX_LEASE_LIMIT=20
PUBLISHING_OUTBOX_CONCURRENCY=4
PUBLISHING_OUTBOX_MAX_DELIVERY_ATTEMPTS=20
```

Production must enable TikTok and one Instagram path. Use `instagram` with
Facebook Login credentials, or use `instagram-standalone` with
`INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET`. Never enable both by accident.

Store these values in Secret Manager and mount them as environment variables:

```text
DATABASE_URL
REDIS_URL
PUBLISHING_SERVICE_ASSERTION_KEY_BASE64
PUBLISHING_TOKEN_KEY_BASE64
FACEBOOK_APP_SECRET or INSTAGRAM_APP_SECRET
TIKTOK_CLIENT_SECRET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
PUBLISHING_MEDIA_TOKEN_SECRET
PUBLISHING_MEDIA_QUOTA_SECRET
```

The assertion key, token-encryption key, media-token secret, and media-quota
secret must all be independently generated. The two key values are standard
base64 encodings of exactly 32 random bytes. Do not copy provider credentials,
Redis URLs, PostgreSQL URLs, or cryptographic material into a command, source
file, image layer, log, or browser-visible environment variable.

The ClipStitchr web deployment separately needs:

```text
PUBLISHING_SERVICE_ORIGIN=<exact Cloud Run HTTPS origin>
PUBLISHING_SERVICE_ISSUER=clipstitchr-web-production
PUBLISHING_SERVICE_AUDIENCE=clipstitchr-publishing-production
PUBLISHING_SERVICE_ASSERTION_KEY_BASE64=<same assertion key version>
```

The service does not need `PUBLISHING_SERVICE_ORIGIN`; that value belongs only
to the web proxy that calls it.

## Apply the additive migrations

Create a database backup and prove a restore before the first production
migration. The migration image must contain the Prisma CLI and both committed
migrations:

```text
20260802080000_baseline_focused_postiz_core
20260802090000_add_publishing_sidecars
```

Deploy a single-task migration job from the exact candidate image. Mount only
`DATABASE_URL` plus any environment the image needs to start the Prisma command.
The job command is:

```bash
npm run prisma:migrate:deploy --workspace @clipstitchr/publishing-service
```

Execute it once and retain the logs and exit status. Then verify:

- both migrations are recorded by Prisma;
- the focused Postiz tables retain their pre-existing extra columns and rows;
- tenant, provider, receipt, publication, schedule, and outbox triggers exist;
- no table, column, index, or row was dropped or rewritten; and
- the application role can perform only the expected reads and writes.

The first release rolls back by shifting Cloud Run traffic to the prior image.
The additive database objects stay in place until a separately reviewed cleanup
can prove they are unused. Do not improvise a destructive down migration.

## Deploy a candidate revision

Use a dedicated service identity. The service currently needs public ingress
because TikTok calls its webhook. Application authentication still protects
every non-webhook `/v1` route.

The minimum instance and always-allocated CPU settings are required because the
outbox dispatcher works between HTTP requests. PostgreSQL leasing makes more
than one healthy instance safe, but the first release should keep a small bound
until provider and database capacity are measured.

```bash
SERVICE=clipstitchr-publishing-service
SERVICE_ACCOUNT=140346842368-compute@developer.gserviceaccount.com

gcloud run deploy "$SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --image "$IMAGE" \
  --execution-environment gen2 \
  --service-account "$SERVICE_ACCOUNT" \
  --allow-unauthenticated \
  --ingress all \
  --port 8080 \
  --cpu 2 \
  --memory 1Gi \
  --concurrency 40 \
  --min-instances 1 \
  --max-instances 3 \
  --no-cpu-throttling \
  --timeout 60s \
  --startup-probe=httpGet.path=/readyz,periodSeconds=5,timeoutSeconds=5,failureThreshold=24 \
  --readiness-probe=httpGet.path=/readyz,periodSeconds=5,timeoutSeconds=5,failureThreshold=3 \
  --liveness-probe=httpGet.path=/healthz,periodSeconds=10,timeoutSeconds=5,failureThreshold=3 \
  --no-traffic \
  --tag candidate
```

Add non-secret values with an environment file and secrets with `--set-secrets`.
Do not paste real values into this documented command. Confirm the installed
`gcloud` version supports the probe flags before deployment.

Cloud Run minimum instances are a best-effort floor, not a scheduler guarantee.
Monitor outbox age and lease recovery instead of assuming one process will live
forever.

## Candidate smoke checks

Run all checks against development or an approved provider test environment
first:

1. Confirm `/healthz` returns liveness and `/readyz` reports PostgreSQL and
   Redis ready without exposing connection strings.
2. Confirm an unsigned request to every protected route is rejected before a
   database or provider call.
3. Confirm a valid assertion works once, then the exact replay is rejected.
4. Connect one approved Instagram account and one approved TikTok account.
   Verify callback state, PKCE where supported, tenant ownership, encrypted
   credentials, refresh serialization, and disconnect.
5. Fetch fresh TikTok creator information, display the returned privacy and
   interaction options, collect explicit consent, and create one test post.
6. Verify TikTok inbox delivery is action-required, not published. Verify a
   `PUBLISH_COMPLETE` event can be published without a public post identifier.
7. Exercise signed TikTok webhook success, duplicate delivery, stale timestamp,
   wrong client key, bad signature, unsupported event, and an oversized body.
8. Create an Instagram container through an approved test account and observe
   the terminal provider result. Do not infer success from an accepted request.
9. Schedule a post across a DST boundary and confirm the saved local time, IANA
   zone, chosen UTC offset, and resolved instant are unchanged on reload.
10. Stop a candidate instance while work is leased. Confirm another instance
    safely recovers the lease and never repeats an uncertain provider call.
11. Exhaust tenant and global limits. Confirm `429` and `Retry-After` arrive
    before provider, signed-media, or state-changing work.
12. Confirm logs contain no tokens, secrets, OAuth codes, signed URLs, captions,
    object keys, database URLs, or Redis URLs.

Only an observable authorized provider result counts as a live-publishing
smoke. Record provider IDs and states in restricted release evidence, never in
public logs.

## Promotion and rollback

Before shifting traffic:

- make the exact Corresponding Source for the deployed commit available;
- verify the source page and archive checksum;
- complete desktop and mobile pointer and keyboard checks;
- record the image digest, migration result, provider test evidence, and
  rollback owner;
- keep Post Bridge creation and inspection behavior at the current cutover
  stage; and
- confirm no unresolved provider attempt would be duplicated by rollback.

Promote the tested revision gradually. If HTTP behavior fails before provider
acceptance, shift traffic back. If a provider may have accepted work, stop new
creation and reconcile receipts before retrying or returning anything to Post
Bridge. Never delete a receipt, outbox row, media manifest, or Post Bridge
history to make rollback look clean.

## Monitoring

Alert on:

- `/readyz` failures;
- process restarts and fatal outbox-loop exits;
- oldest pending outbox age;
- expired leases and maximum-attempt dead letters;
- `outcome_unknown` attempts;
- provider terminal failures and long processing states;
- OAuth, service-assertion, and webhook replay rejection changes;
- tenant or global rate-limit saturation;
- PostgreSQL and Redis connection pressure; and
- media-gateway `410`, `416`, `429`, and upstream identity failures.

The scheduler is healthy only when durable work advances and uncertain outcomes
remain quarantined. A green liveness endpoint alone is not completion evidence.

## References

- `docs/features/publishing/post-bridge-cutover.md`
- `docs/features/publishing/publishing-persistence-model.md`
- `docs/features/publishing/provider-readable-media-gateway.md`
- `web/services/publishing-service/README.md`
- `web/services/publishing-service/docs/postgresql-persistence.md`
- `web/services/publishing-service/docs/redis-runtime.md`
- [Cloud Run minimum instances](https://docs.cloud.google.com/run/docs/configuring/min-instances)
- [Cloud Run health checks](https://docs.cloud.google.com/run/docs/configuring/healthchecks)
- [Current `gcloud run deploy` flags](https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy)
