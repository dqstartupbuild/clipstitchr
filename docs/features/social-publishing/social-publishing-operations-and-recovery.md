# Social Publishing Operations and Recovery

## What support can inspect

Use Convex owner-scoped records. Start with the logical `socialPosts` row, then
inspect its targets, attempts, publications, media grants, and notifications.
Provider response JSON is server-only diagnostics. Never paste it into customer
messages without checking that it is redacted. Tokens, encryption keys, signed
URLs, and webhook signatures must never enter tickets or logs.

Target meanings:

- `needs_attention`: reconnect or update saved controls, then review and resume.
- `held`: billing or an account transition stopped not-started work.
- `waiting_for_user`: open TikTok and finish; it is not public.
- `outcome_unknown`: do not resend. Reconcile status or verify the account.
- `partially_published`: preserve successful targets and work only on failures.

## Recovery

The one-minute due and status planners are idempotent. Immediate Cloud Run
dispatch and delayed recovery share the existing worker queue. Before the
first provider call that can create a post, the worker durably marks the
attempt `do_not_retry_reconcile_only`. A reclaimed job must then reconcile
provider status instead of repeating that call. Persisted provider IDs and the
attempt idempotency key provide the same protection after the provider returns.
Reconciliation reuses the newest running or ambiguous attempt. If there is no
saved attempt to reconcile, the worker records an ambiguous result and stops
without initializing another provider request.
TikTok reconciliation with a saved `publish_id` queries only that accepted
operation. Creator capability validation runs before initialization, not after
provider acceptance, so changed controls cannot block status recovery.

Provider diagnostics pass through a recursive sanitizer before storage. It
redacts token-, authorization-, cookie-, signature-, and secret-shaped fields,
including those embedded in strings. Support should still treat all provider
diagnostics as sensitive server-only data. Social provider-job failures use
the same sanitizer before retry state, failure state, or worker logs receive
the message. When worker retries are exhausted after an irreversible request or
a saved provider publish reference, the target remains `outcome_unknown` and
reconciliation-only. It never becomes an ordinary resumable failure.

For an incident:

1. set `SOCIAL_PUBLISHING_PROVIDER=post_bridge` to stop new in-house user
   writes without deleting existing records;
2. pause affected product queues if only a product is involved;
3. do not change ambiguous targets to scheduled;
4. repair credentials or provider configuration;
5. deploy and run the provider `--check`;
6. test with an authorized non-public account;
7. let users explicitly review and resume held work.

Opaque media grants expire after 24 hours, authorize one exact owner asset and
target, and are revoked after terminal completion or a terminal failure. The
terminal-failure cleanup includes jobs that exhaust the provider worker's retry
limit. The worker creates grants only for a new provider initialization. Status
reconciliation reuses persisted provider IDs and never mints another media
grant. R2 lifecycle cleanup should remove orphaned `social-post-assets` only
after confirming no post row refers to them.

The data-deletion status endpoint is intentionally not given an owner rate
bucket: it is a read-only lookup behind a random UUID confirmation code and is
needed by Meta. Its backing query is server-secret protected and returns
`private, no-store`; the mutating deletion callback uses the signed-callback
rate bucket.

Meta can complete its Instagram webhook `GET` verification challenge while the
production provider remains `post_bridge`. That challenge only compares the
secret verification token and returns Meta's challenge value. Signed webhook
`POST` events are still rejected until the provider flag is deliberately
changed to `in_house`.

Webhook replay rows retain the canonical event ID and disposition. A replay of
an already processed event returns success without repeating its effects. A
provider retry of a previously failed event resumes against the same row and
can mark that record processed after recovery. A terminal TikTok publish
webhook clears provider-fetch grants and any queued worker retry sees the
webhook-updated target state before making another provider request. Terminal
state writes are monotonic: a late worker error or out-of-order failure event
cannot downgrade a webhook-confirmed publication.
