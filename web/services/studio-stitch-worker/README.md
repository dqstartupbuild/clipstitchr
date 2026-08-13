# Studio Stitch execution worker

## Purpose

This Cloud Run-compatible worker executes frozen Studio Stitch V1 recipes. It
claims one Product-scoped run through the web coordinator, downloads only owned
R2 inputs, renders every classic or talking recipe, verifies each final MP4 with
`ffprobe`, uploads immutable output proofs, and atomically completes the run.
It never changes classic Stitchr or accepts output metadata from a browser.

## Coordinator contract

Every request is `POST`, carries `x-studio-stitch-worker-secret`, and uses the
`studio-stitch-claim-v1` contract.

- `/api/studio/stitch/worker/claim`
- `/api/studio/stitch/worker/lease-state`
- `/api/studio/stitch/worker/progress`
- `/api/studio/stitch/worker/checkpoints/save`
- `/api/studio/stitch/worker/checkpoints/get`
- `/api/studio/stitch/worker/cost-reservations`
- `/api/studio/stitch/worker/complete`
- `/api/studio/stitch/worker/fail`

The run remains `intentReady` while lease and progress fields describe active
execution. Claim, lease recovery, cancellation, retry, checkpoint revision, and
completion are all atomic Convex operations. Each operation independently
rechecks the Studio switch, grant, owner, active Product, run, and frozen recipe.

## Runtime pipeline

1. Parse the claimed recipe snapshot with the strict V1 parser.
2. Stream owned R2 sources into a bounded temporary workspace and probe them.
3. When reaction input is absent, search the official DanSUGC B-roll REST API,
   checkpoint a deterministic single-creator selection, purchase those exact
   IDs, and reconcile uncertain purchase responses against purchase history.
4. Use Gemini only for a recipe whose demo-intelligence requirement is not
   already satisfied by input.
5. Use ElevenLabs word timings for a talking recipe that requires provider
   voice generation.
6. Render segments, transitions, overlays, captions, cutaways, music, and voice
   with `ffmpeg`.
7. Probe the final MP4, upload it with SHA-256 metadata, verify R2 HEAD facts,
   checkpoint it, and complete only when every frozen recipe has one output.

Cancellation and lease state are checked after every reservation and before
each provider, renderer, and upload side effect. Provider bodies and media are
streamed through hard byte caps. Every HTTP request has a deadline and rejects
redirects. Coordinator and durable failure messages use fixed public text.

DanSUGC integration follows the current official `GET /api/v1/broll`,
`POST /api/v1/broll/purchase`, and `GET /api/v1/broll/purchases` contract.
Only download URLs returned by a purchase are used. Their exact HTTPS host must
also appear in `STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS`; wildcards are rejected.
Purchased URLs are never checkpointed or logged.

## Output materialization

The authenticated user accepts and materializes a generated output with
`POST /api/studio/stitch/outputs/:outputId/materialize` and body
`{productId,idempotencyKey}`. The route rechecks the immutable R2 version,
SHA-256, size, content type, owner prefix, and worker-probed media facts before
one Convex transaction creates the Product Library clip and saves durable
editor (`studioOutput`) and publishing (`studio-stitch-output`) identities.

## Environment

Required for execution:

- `STUDIO_BETA_ENABLED=true`
- `STUDIO_STITCH_EXECUTION_ENABLED=true`
- `STUDIO_STITCH_WORKER_SECRET` with at least 32 characters
- `STUDIO_STITCH_WORKER_API_ORIGIN`
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, and
  `R2_SECRET_ACCESS_KEY`

Optional provider variables are `DANSUGC_API_KEY` plus
`STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS`, `GEMINI_API_KEY`, and
`ELEVENLABS_API_KEY`. Missing optional providers fail only recipes that require
them. Worker ID, lease, polling, coordinator timeout, scratch root, `ffmpeg`,
`ffprobe`, and font paths are listed in `web/.env.example`.

## Image and deployment check

Build from `web/`. The image contains Node 22, production npm dependencies,
`ffmpeg`, `ffprobe`, `tini`, the worker, the frozen recipe parser/types, and the
vendored TikTok Sans font. Test sources are removed from the runtime image. It
does not copy an environment file or credentials.

```bash
docker build --provenance=false --platform linux/amd64 \
  -f services/studio-stitch-worker/Dockerfile \
  -t clipstitchr-studio-stitch-worker:local .

docker run --rm --platform linux/amd64 \
  clipstitchr-studio-stitch-worker:local --check
```

Disabling the optional BuildKit provenance attestation makes the local proof
digest reproducible without changing its runtime layers. `--check` performs no
network call and needs no credentials. It probes local `ffmpeg` and `ffprobe`,
prints command availability plus disabled readiness and the missing environment
list, and exits successfully when both commands are present. The final
current-lock `linux/amd64` image ID is
`sha256:f31ac160edf9118ef4504495d1ab82608efe58ef057afc1956a41756594d109f`.
Its credential-free check returned `commandsAvailable:true`,
`providers.render:true`, `enabled:false`, and `ready:false`, as expected without
runtime environment or secrets. No deploy is part of repository verification.

## Production Cloud Run Job strategy

Production execution is a Cloud Run **Job**, not a request-serving Cloud Run
Service. Each scheduled execution uses `--once`, claims at most one eligible
intent, checkpoints or completes it, and exits. Atomic leases make overlapping
invocations safe, while a later invocation can recover an expired lease. The
long-running `--run` loop is only for a controlled local or dedicated process;
it is not the production Job entrypoint.

The following commands are a deployment reference. They were not run as part of
this change and do not deploy automatically.

```bash
cd web

PROJECT_ID=clipstitchr
REGION=us-central1
TAG="studio-stitch-$(git rev-parse --short HEAD)"
REPOSITORY="$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr"

docker build --platform linux/amd64 \
  -f services/studio-stitch-worker/Dockerfile \
  -t "$REPOSITORY/studio-stitch-worker:$TAG" \
  .

docker push "$REPOSITORY/studio-stitch-worker:$TAG"
```

Store credentials in Secret Manager before deployment. Do not place them in
`--set-env-vars`. The coordinator secret must be the same strong random value
configured in the web/Convex environment.

```bash
gcloud run jobs deploy clipstitchr-studio-stitch-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --image "$REPOSITORY/studio-stitch-worker:$TAG" \
  --args=--once \
  --tasks 1 \
  --max-retries 0 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 60m \
  --execution-environment gen2 \
  --service-account "STUDIO_STITCH_WORKER_SERVICE_ACCOUNT" \
  --set-env-vars '^@^STUDIO_BETA_ENABLED=true@STUDIO_STITCH_EXECUTION_ENABLED=true@STUDIO_STITCH_WORKER_API_ORIGIN=https://YOUR_APP_HOST@STUDIO_STITCH_WORKER_ID=cloud-run-studio-stitch@STUDIO_STITCH_WORKER_LEASE_SECONDS=300@STUDIO_STITCH_WORKER_HTTP_TIMEOUT_MS=30000@R2_ACCOUNT_ID=YOUR_R2_ACCOUNT_ID@R2_BUCKET_NAME=YOUR_R2_BUCKET@STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS=YOUR_EXACT_APPROVED_MEDIA_HOSTS' \
  --set-secrets STUDIO_STITCH_WORKER_SECRET=clipstitchr-studio-stitch-worker-secret:latest,R2_ACCESS_KEY_ID=clipstitchr-r2-access-key-id:latest,R2_SECRET_ACCESS_KEY=clipstitchr-r2-secret-access-key:latest,DANSUGC_API_KEY=clipstitchr-dansugc-api-key:latest,GEMINI_API_KEY=clipstitchr-gemini-api-key:latest,ELEVENLABS_API_KEY=clipstitchr-elevenlabs-api-key:latest
```

Omit an optional provider secret from `--set-secrets` when that provider is not
enabled. Recipes that require the missing provider remain honestly unavailable.
`--max-retries 0` is deliberate: uncertain paid-provider outcomes must return to
the durable reconciliation path, never be blindly replayed by Cloud Run.

Grant a scheduler service account `roles/run.invoker`, then trigger the Job on a
short cadence. This example runs once per minute; tune the schedule without
changing claim safety.

```bash
gcloud scheduler jobs create http clipstitchr-studio-stitch-dispatch \
  --project "$PROJECT_ID" \
  --location "$REGION" \
  --schedule='* * * * *' \
  --uri="https://run.googleapis.com/v2/projects/$PROJECT_ID/locations/$REGION/jobs/clipstitchr-studio-stitch-worker:run" \
  --http-method=POST \
  --message-body='{}' \
  --oauth-service-account-email="STUDIO_STITCH_SCHEDULER_SERVICE_ACCOUNT" \
  --oauth-token-scope=https://www.googleapis.com/auth/cloud-platform
```

After deploying a new image, execute the same Job image once with the
credential-free check mode. The check inspects commands and configuration only;
it does not claim work or contact a provider.

```bash
gcloud run jobs execute clipstitchr-studio-stitch-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --args=--check \
  --wait
```

## File map and verification

- `adapters/`: fixed-host HTTP, provider, R2, media probe, and render boundaries
- `contracts/`: worker-only serializable and dependency contracts
- `runtime/`: configuration, claim dependency wiring, and execution loop
- `validation/`: strict claim and checkpoint parsers
- `workspace/`: bounded temporary directory lifecycle and cleanup

Run focused tests with:

```bash
npx vitest run services/studio-stitch-worker \
  app/api/studio/stitch/worker \
  app/api/studio/stitch/outputs \
  convex/studioReelWorker \
  convex/studioReelOutputs/materialize.test.ts \
  lib/clipstitchr/studio/stitch \
  lib/clipstitchr/server/studio/stitch
```

This focused command passes 38 files and 73 tests. Provider tests use fakes
only. They make no provider or media network call.
