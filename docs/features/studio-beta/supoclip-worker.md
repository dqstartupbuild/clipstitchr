# SupoClip source reference and Studio Clips deployment

## Source and boundary

The supplied SupoClip 0.1.0 tree is preserved literally at
`web/vendor/supoclip/v0_1_0/upstream`. It contains 317 regular files and 99
directories. The authoritative deterministic manifest digest is
`e8ee9d5ed41062e6a059c81835ca1834a49a651dcb6e5bcb6a25ad67f76fe098`.
Run `cd web && npm run supoclip:verify-vendor` to verify the snapshot without
executing upstream code.

The Studio Clips TypeScript worker treats the snapshot as a behavior and media
asset reference. It never imports or executes SupoClip Python, frontend, MCP,
shell, migration, install, or task code. The bundled caption fonts are copied
into the isolated runtime image and validated before use.

## Feature inventory

| SupoClip area | ClipStitchr disposition |
| --- | --- |
| YouTube acquisition | Retained as fixed-host canonical yt-dlp acquisition with bounded commands |
| Uploaded video source | Retained through owner/Product-scoped R2 objects |
| Transcription | Retained through bounded AssemblyAI adapter and saved grounded excerpts |
| Candidate selection/scoring | Retained through strict Google or OpenAI structured JSON |
| Portrait B-roll | Retained through optional fixed-host Pexels adapter |
| Original and vertical output | Retained as source framing and center-cropped 1080x1920 |
| Caption templates and bundled fonts | Seven templates and all 21 supplied font IDs retained |
| Custom fonts | Retained with owner/Product-scoped R2 acquisition and SFNT/name-table validation |
| Trim | Retained as a real immutable render revision |
| Split | Retained as real ordered range outputs |
| Merge | Retained as a real ordered same-task render revision |
| Caption update/restyle | Retained with saved cues and clean-master rendering |
| Project/Product style | Retained as a durable Product default plus optional real bounded batch revision |
| Regenerate | Retained as deterministic rerender; provider-bound free-text instructions are explicitly unavailable |
| TikTok/Reels/Shorts exports | Retained as explicit real FFmpeg presets with SupoClip bitrates and 9:16 padding |
| Resume/progress/cleanup | Rebuilt with Convex leases, R2 checkpoints, heartbeat, cancellation, and bounded cleanup |
| Face-tracked `vertical_pan` | Removed from the available contract |
| `vertical_split` split-screen composition | Removed from the available contract |
| Emoji/power-word animation | Not ported; current captions are deterministic libass styling |
| Transition video assets/insertion | Not ported |
| Silence/filler cleanup and noncontiguous source maps | Not ported |
| SupoClip Better Auth, users, admin | Replaced by Clerk, Studio access, and Product ownership |
| SupoClip PostgreSQL/Redis task model | Replaced by bounded Convex records and leases |
| SupoClip billing, subscriptions, email, feedback, analytics | Not imported |
| SupoClip frontend, API proxy, MCP server | Not imported or executed |

## Runtime and provider configuration

The production worker needs these non-secret environment values:

- `STUDIO_BETA_ENABLED=true`
- `STUDIO_CLIPS_WORKER_QUEUE_ENABLED=true`
- `STUDIO_CLIPS_WORKER_API_ORIGIN=https://<coordinator-host>`
- `STUDIO_CLIPS_ANALYSIS_PROVIDER=google` or `openai`
- `STUDIO_CLIPS_ANALYSIS_MODEL=<exact-model-id>`
- optional bounded lease, poll, HTTP, AssemblyAI timing, worker ID, scratch,
  FFmpeg, ffprobe, yt-dlp, and built-in-font settings documented in `.env.example`

Secret Manager should provide:

- `STUDIO_CLIPS_WORKER_SECRET` (unique, at least 32 bytes)
- `ASSEMBLYAI_API_KEY`
- exactly the selected `GOOGLE_API_KEY` or `OPENAI_API_KEY`
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- optional `PEXELS_API_KEY` when B-roll should be available

The coordinator environment and Convex deployment also require the exact queue
switch and matching worker secret. Enabling only the worker does not make the
coordinator claimable; enabling only the coordinator leaves work queued.

## Cloud Run Job strategy

Use a Cloud Run **Job**, not a continuously listening Service. Each scheduled
execution uses `--once`, claims at most one item, and exits after completing,
failing, or finding no work. This bounds execution time and avoids placing the
continuous `--run` poll loop inside a Job. `--run` is for supervised local or
dedicated always-on process use only.

The suggested production trigger is a one-minute Cloud Scheduler call to the
Cloud Run v2 `jobs:run` endpoint. Configure one task and no parallelism so the
Product-level one-active rule remains the primary authority without wasteful
parallel idle claims. Set the task timeout above the maximum 90-minute source
plus provider/render allowance; two hours is the documented starting shape.
The worker's leases and checkpoints make a later scheduler execution resume
safely after a process or platform timeout.

The following commands are a deployment recipe only. They were **not executed**
as part of this implementation:

```bash
cd web

PROJECT_ID=clipstitchr
REGION=us-central1
TAG="studio-clips-v2-$(git rev-parse --short HEAD)"
REPOSITORY="$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr"
IMAGE="$REPOSITORY/studio-clips-worker:$TAG"
WORKER_SERVICE_ACCOUNT="140346842368-compute@developer.gserviceaccount.com"

docker build --platform linux/amd64 \
  -f services/studio-clips-worker/Dockerfile \
  -t "$IMAGE" .
docker push "$IMAGE"

gcloud run jobs deploy clipstitchr-studio-clips-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --image "$IMAGE" \
  --tasks 1 \
  --parallelism 1 \
  --max-retries 0 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 2h \
  --execution-environment gen2 \
  --service-account "$WORKER_SERVICE_ACCOUNT" \
  --args=--once \
  --set-env-vars '^@^STUDIO_BETA_ENABLED=true@STUDIO_CLIPS_WORKER_QUEUE_ENABLED=true@STUDIO_CLIPS_WORKER_API_ORIGIN=https://<coordinator-host>@STUDIO_CLIPS_ANALYSIS_PROVIDER=google@STUDIO_CLIPS_ANALYSIS_MODEL=gemini-2.5-flash@STUDIO_CLIPS_WORKER_LEASE_SECONDS=300@STUDIO_CLIPS_WORKER_HTTP_TIMEOUT_MS=30000' \
  --set-secrets 'STUDIO_CLIPS_WORKER_SECRET=clipstitchr-studio-clips-worker-secret:latest,ASSEMBLYAI_API_KEY=clipstitchr-assemblyai-api-key:latest,GOOGLE_API_KEY=clipstitchr-google-api-key:latest,R2_ACCOUNT_ID=clipstitchr-r2-account-id:latest,R2_BUCKET_NAME=clipstitchr-r2-bucket-name:latest,R2_ACCESS_KEY_ID=clipstitchr-r2-access-key-id:latest,R2_SECRET_ACCESS_KEY=clipstitchr-r2-secret-access-key:latest,PEXELS_API_KEY=clipstitchr-pexels-api-key:latest'

gcloud scheduler jobs create http clipstitchr-studio-clips-dispatch \
  --project "$PROJECT_ID" \
  --location "$REGION" \
  --schedule='* * * * *' \
  --uri="https://run.googleapis.com/v2/projects/$PROJECT_ID/locations/$REGION/jobs/clipstitchr-studio-clips-worker:run" \
  --http-method=POST \
  --oauth-service-account-email="$WORKER_SERVICE_ACCOUNT" \
  --oauth-token-scope='https://www.googleapis.com/auth/cloud-platform' \
  --message-body='{}'
```

Before using the scheduler identity, grant only the Cloud Run Job execution and
service-account impersonation permissions it needs. Grant the worker identity
Secret Manager access only to the named secrets. Do not place secret values in
`--set-env-vars`, image layers, logs, scheduler bodies, or source control.

After deployment, run the offline image check first, then one explicit one-claim
execution while observing coordinator/Convex events:

```bash
gcloud run jobs execute clipstitchr-studio-clips-worker \
  --project "$PROJECT_ID" --region "$REGION" --args=--check --wait

gcloud run jobs execute clipstitchr-studio-clips-worker \
  --project "$PROJECT_ID" --region "$REGION" --args=--once --wait
```

Do not enable the scheduler until `--check`, a controlled `--once`, R2 checksum
proof, and completion persistence have all been observed in the target environment.

## Docker image

`web/services/studio-clips-worker/Dockerfile` uses
`node:22-bookworm-slim`, pins npm 11.5.1, runs scripts-disabled production
`npm ci`, installs FFmpeg/ffprobe, Python, CA certificates, and tini, and pins
yt-dlp 2026.06.09 by immutable URL and SHA-256. It runs as the non-root `node`
user. The entrypoint is the TypeScript worker and the default command is
`--once`; the health check is the offline `--check` command.

The final release proof must build with `--platform linux/amd64` and execute
`--check` inside that exact image. No upstream program or install script is run.

The local release proof on 2026-08-13 used package-lock SHA-256
`52d5711b1c980c8507dbeb4e5964567e40b5770ee28240acc362aa775469329a`.
Docker reported the linux/amd64 platform manifest
`sha256:377b7043071b7c6f6d22b92f74b5b57b465e8a8c431b5ad33c534ecb8c84f5f7`
and tagged image ID
`sha256:35a5490594124b75bdc3d83d7b5b3850b21cab4d65d9f81ddfc431e29201b9e1`.
The in-container `--check` returned `ok:true`, `networkRequired:false`, claim
schema `studio-clips-claim-v2`, and the expected credential-free unavailable
environment list. Nothing was pushed or deployed.

## Related paths

- HTTP/API and persistence contract: `docs/features/studio-beta/clips-worker-core.md`
- worker runtime: `web/services/studio-clips-worker`
- authenticated coordinator routes: `web/app/api/studio/clips`
- persistence: `web/convex/studioClips*`
- shared DTOs: `web/lib/clipstitchr/types/studioClips`
- literal source: `web/vendor/supoclip/v0_1_0`
- rate policy: `docs/operations/security/rate-limits.md`
