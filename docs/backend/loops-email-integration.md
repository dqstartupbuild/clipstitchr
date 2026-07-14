# Loops Email Integration

Reviewed: 2026-07-13

## Status

The app-owned Loops adapter, canonical Convex records, durable provider outbox,
signed webhook route, app-owned confirmation route, browser-recognition token,
and strict fifty-tool gate rollout control are implemented. The official
`loops` JavaScript SDK is installed at the `^7.0.0` package range. All provider
dispatch and public gate changes remain fail-closed behind explicit environment
configuration.

The temporary FollowUs AI team now contains the six bounded contact properties,
one confirmation-only transactional template, and four ClipStitchr marketing
Workflows. The Workflows remain drafts. The shared sender domain is not fully
verified, no webhook is configured, and distinct ClipStitchr development and
production teams do not exist yet. No deployment, Workflow activation, test or
live email send, migration, or public rollout was performed. Keep
`LOOPS_EMAIL_ENABLED=false`, `LOOPS_WEBHOOKS_READY=false`,
`LOOPS_WORKFLOWS_READY=false`, `LOOPS_EMAIL_NATIVE_ENABLED=false`, and
`PUBLIC_TOOL_GATE_ROLLOUT` unset until the operator checklist in
`docs/backend/public-tool-email-rollout-runbook.md` is complete.

## Decision

ClipStitchr integrates Loops through a small app-owned Convex adapter using the
official `loops` JavaScript SDK.

ClipStitchr will not mount `@devwithbobby/loops` as the foundational email
integration. The community component can create contacts, send events, and send
transactional messages, but it does not remove the application work required
for durable retries, idempotency, consent reconciliation, attribution,
webhooks, current API coverage, and ClipStitchr's existing rate-limit model.

This is a thin custom integration, not a custom email service:

- Loops owns contact delivery state, marketing Workflows, campaigns, email
  templates, unsubscribe links, suppression, and actual message delivery.
- Convex owns ClipStitchr's canonical contact, consent evidence, tool
  attribution, unlock state, queued provider operations, and the local view of
  email-subscription and delivery status.
- The official Loops SDK owns the typed API client and current provider
  request/response contract.
- No browser calls Loops directly and no public Convex action exposes a generic
  email-send capability.

## Why The Community Convex Component Is Not The Foundation

The evaluated component is `@devwithbobby/loops` version `0.2.0`, released on
January 19, 2026. It is a useful community package for a small prototype. Its
published surface includes contact operations, workflow events, transactional
sends, operation logging, and queries that can help inspect send frequency.

ClipStitchr's approved use case needs more than that surface:

- Retried workflow events and transactional sends need provider idempotency
  keys. Loops' current event and transactional endpoints support an
  `Idempotency-Key`, but the component's published event and transactional
  option types do not expose it.
- Unsubscribe, list-membership, hard-bounce, and complaint state must flow back
  into the canonical Convex contact. The component does not provide the signed
  Loops webhook ingestion and application reconciliation required here.
- The current Loops API and official SDK support mailing-list membership,
  custom contact properties, suppression checks, attachments, and additional
  transactional options. The component's documented API coverage is narrower.
- The component stores its own contact and email-operation copies. ClipStitchr
  already needs app-owned contact, capture, consent, interaction, and outbox
  records, so a second component-owned contact model would add reconciliation
  work without becoming the product source of truth.
- The component's rate-limit examples perform a separate check before a send.
  ClipStitchr already uses `@convex-dev/rate-limiter` to atomically consume
  per-recipient, per-user or client, and global quotas before protected work.
  The provider wrapper must not create a parallel, weaker quota path.
- The component README warns that its convenience API exports functions without
  authentication unless the application wraps them. ClipStitchr would still
  need private wrappers, validation, allowlists, and authorization.

The official `loops` SDK is the smaller dependency boundary. Loops documents it
as its official TypeScript-capable JavaScript SDK, and it lets the adapter use
current official API features without introducing another database model.

## Architecture Boundaries

### Convex is the product source of truth

A successful public-tool form first commits the following product state in one
Convex transaction:

1. The canonical marketing contact and current consent evidence.
2. The individual tool-lead capture and attribution record.
3. The opaque browser-unlock token hash when one is issued.
4. A durable email-provider operation that references the contact and approved
   operation kind.
5. A scheduled internal action that will process that provider operation after
   the transaction commits.

The browser receives its non-enumerating accepted response and unlock only
after the local transaction succeeds. It does not wait for Loops. A temporary
Loops outage therefore cannot take away a tool result or cause the lead record
and consent evidence to disappear.

### Loops is the delivery and engagement system

The scheduled internal action uses `LoopsClient` from the official `loops`
package. It performs only an allowlisted provider operation:

- Upsert a contact.
- Explicitly resubscribe a contact after app-owned re-consent.
- Apply an opaque-user-ID unsubscribe correction when a raced resubscribe must
  be reversed.
- Send an approved event that can start a Loops Workflow.
- Send an approved transactional template.

The action records provider acceptance or a bounded failure classification
through an internal Convex mutation. A transient network failure, Loops `429`,
or eligible provider `5xx` response schedules a bounded retry. A permanent
validation or configuration failure moves the operation to a reviewable
dead-letter state.

Before an SDK call, an internal mutation atomically claims the operation with a
bounded lease. A terminal operation cannot be claimed again. A worker may
reclaim an expired lease only when the operation is still inside its approved
retry window. Each claim schedules one recovery wakeup just after lease expiry,
so an action crash cannot strand the operation. Shared Loops pacing is consumed
next. If capacity is unavailable, the local limiter's returned retry delay
releases the lease and reschedules the operation without spending an attempt.
Only the mutation immediately before the final canonical projection read and
SDK call increments the provider-attempt count. This local claim is the first
duplicate-send boundary; the Loops idempotency key is the second.

When provider dispatch is disabled, due pending operations move to `held`
without a recurring retry loop. After configuration is deliberately restored,
an operator can call
`email/resumeHeldEmailProviderOperations:resumeHeldEmailProviderOperations`
with `RATE_LIMIT_API_SECRET` and a server timestamp. It resumes at most fifty
operations per call and reports whether another bounded batch remains.

Immediately before dispatch, the processor re-reads the canonical contact and
operation authorization. Marketing contact sync and Workflow events are
cancelled when the contact is unverified, opted out, suppressed, deleted,
tombstoned, or no longer eligible for that enrollment. A contact-projection
operation must succeed before a dependent Workflow-event operation becomes
claimable.

The provider API key is consumed only by the Convex dispatch action. The
server-only Next.js readiness check also requires it to be configured before an
email-native gate can leave control, but it never creates a provider client or
sends with that key. The key is never passed through a client request, stored
in a table, logged, or exposed through a public function argument.

### Signed webhooks reconcile provider state

A dedicated Convex HTTP route receives Loops webhooks. The handler must:

- Read the raw request body before parsing it.
- Require and verify `Webhook-Signature`, `Webhook-Id`, and
  `Webhook-Timestamp` with `LOOPS_SIGNING_SECRET`.
- Reject stale timestamps and oversized or malformed bodies.
- Deduplicate accepted events by `Webhook-Id` before applying state.
- Accept only explicitly supported event names and schema versions.
- Update the canonical contact for audience unsubscribe, mailing-list changes,
  deletion, hard bounce, and complaint/suppression events.
- Apply provider event time and a conservative state precedence so a delayed
  subscribed or created event cannot reverse a newer unsubscribe, suppression,
  or deletion tombstone.
- Record only bounded operational metadata needed for support and delivery
  health.

The implemented route is `POST /webhooks/loops` on the Convex HTTP origin. It
requires `application/json`, caps both declared and streamed raw bodies at 64
KiB, limits `Webhook-Id` to 256 characters, and accepts a timestamp only within
five minutes of server time. It verifies the Loops `v1` HMAC in constant time
over `Webhook-Id.Webhook-Timestamp.rawBody` before JSON parsing. Supported
payloads use webhook schema `1.0.0` and the explicit event allowlist in
`loopsWebhookEventNames.ts`; unknown versions and event names are rejected.
The current allowlist is `contact.created`, `contact.unsubscribed`,
`contact.deleted`, `contact.mailingList.subscribed`,
`contact.mailingList.unsubscribed`, `loop.email.sent`,
`transactional.email.sent`, `email.delivered`, `email.softBounced`,
`email.hardBounced`, `email.unsubscribed`, `email.resubscribed`,
`email.spamReported`, and `testing.testEvent`.

After signature and payload validation, one internal Convex mutation checks the
`Webhook-Id`, applies the supported state transition, and records the processed
ID atomically. The HTTP action returns success only after that transaction
commits. If application fails, no processed marker commits and the endpoint
returns a retryable server error so a provider redelivery is not discarded.

The webhook does not trust an email address alone when an opaque ClipStitchr
contact `userId` or an already-linked Loops contact ID is available.

## Contact Contract

The Loops contact is a delivery projection of the Convex contact, not a second
source of truth for acquisition attribution.

The current adapter sends only these bounded fields:

| Loops field | ClipStitchr value |
| --- | --- |
| `email` | Normalized contact email |
| `userId` | Stable random provider contact key, never an email, raw Convex document ID, or browser token |
| `source` | Stable value such as `ClipStitchr public tools` |
| Custom `contactName` | Required normalized submitted name, preserved without guessing first-name or last-name boundaries |
| Custom `firstTool` | First fixed public-tool catalog key |
| Custom `latestTool` | Most recent fixed public-tool catalog key |
| Custom `leadSegment` | One approved segment key |
| Custom `leadStage` | One approved qualification stage |

Tool inputs, generated results, uploaded media, filenames, calculator values,
campaign details, IP addresses, raw unlock tokens, and analytics visitor IDs do
not become Loops contact properties or event properties.

Normal contact synchronization must omit the Loops `subscribed` property.
Loops warns that sending `subscribed: true` can resubscribe a person who already
opted out. A resubscription requires a separate explicit re-consent operation
with its own consent timestamp and copy version; retries or later tool use must
never silently reverse an unsubscribe.

A Loops `contact.deleted` webhook creates a provider-deletion tombstone in
Convex. It cancels every non-delete provider operation, including unsubscribe
updates, and fences every in-flight or acceptance-unknown call with one final
delete. Normal contact sync and Workflow events therefore cannot recreate that
contact.
Only a later confirmed re-consent flow may deliberately clear a provider-only
tombstone. A ClipStitchr privacy-deletion request anonymizes and retains the
canonical row as a deletion fence, removes every identity and recognition
link, and queues an opaque-key `contactDelete` operation. Every other provider
operation is blocked. A claimed operation that finishes late queues one final
delete compensation, and any late acceptance expedites that matching fence
regardless of the operation's later terminal state. A previously ambiguous
operation already has the same delayed fence. Email work therefore cannot
recreate the Loops contact.

The initial integration does not depend on mailing lists for correctness.
The approved built-in `source` property, five custom properties, and Workflow
events provide segmentation without
making one provider list membership the only record of consent. If mailing
lists are added later, their IDs are server-side configuration and membership
changes must reconcile through signed webhooks.

## Qualified Email Verification

The browser unlock and the marketing-subscription state are separate. A valid
name-and-email submission immediately unlocks the approved browser-local value
after the canonical Convex transaction. It does not need an inbox click to
reveal the result.

Before a new address enters an automated marketing Workflow, ClipStitchr uses a
confirmation step:

1. Convex stores the contact as pending verification and creates a forty-eight
   hour, single-use confirmation-token record. A resend rotates the record and
   invalidates any earlier active token. The same transaction marks every older
   queued or retryable confirmation operation superseded.
2. A private Loops transactional send delivers the confirmation link with
   `addToAudience` disabled.
3. A confirmation `GET` validates enough to render a no-side-effect page. The
   visitor must press an explicit button that sends a same-origin, CSRF-checked
   `POST`; only that `POST` records verified consent and invalidates the token.
4. Only then does the provider adapter upsert the Loops contact and send the
   allowlisted marketing Workflow event.

The confirmation URL is reproducible for safe retries without storing a
plaintext bearer token. It contains a random token-record ID and expiry plus a
signature created with a server-only `EMAIL_CONFIRMATION_TOKEN_SECRET`. Convex
stores the random ID, expiry, digest, and used state; scheduled arguments store
only the provider operation ID. The dispatcher can regenerate the same signed
URL for a retry, while the confirmation route verifies both the signature and
the stored single-use record. The URL never embeds an email, contact ID, or
browser unlock token.

The confirmation page is `no-store`, sends `Referrer-Policy: no-referrer`, does
not load analytics or third-party resources, and never places the bearer token
in a referrer, analytics event, or log. The no-side-effect `GET` prevents common
email security scanners from granting marketing consent merely by following a
link.

The direct `GET` and `POST` route is intentionally excluded from the shared
Clerk proxy and app layout. It emits no scripts and sets `noindex`, `nosniff`,
frame denial, a restrictive content security policy, and private no-store
headers. The short-lived CSRF cookie lasts ten minutes. The `POST` requires the
same origin, caps the form body at 4 KiB, re-verifies the signed reference, and
consumes token, client, and global redemption quota before changing consent.

Immediately before sending a confirmation, dispatch rechecks that the token
record is still the contact's current generation and that the operation was not
superseded. A delayed or retried older operation therefore cannot email a link
that rotation already invalidated.

An already verified and currently subscribed contact does not repeat this step.
An opted-out contact who later submits the form receives an explicit re-consent
confirmation; only a successful confirmation may create the dedicated
`subscribed: true` operation described above. The public capture response never
reveals whether an address was new, verified, subscribed, or previously opted
out.

This app-owned confirmation is necessary because Loops documents that its
built-in double opt-in currently applies to Loops Form endpoints, while API
Create Contact and Update Contact calls are not gated by it. ClipStitchr does
not replace its canonical capture endpoint with a Loops form: doing so would
split consent, attribution, rate limits, and unlock issuance across two
independent writes.

Confirmation emails are operational and contain only the requested
confirmation action. They do not contain product nurture or promotional copy.
Confirmation sends have their own per-address, per-client, and global limits so
the public form cannot be used to mail-bomb arbitrary recipients.

## Marketing Workflow Contract

Lead acquisition, welcome messages, nurture messages, courses, sprints, and
workshop sequences are marketing email in ClipStitchr even when the visitor
explicitly requests them. They must use Loops Workflows or campaigns so Loops
includes unsubscribe handling and honors an opted-out contact.

The initial event vocabulary stays small and versioned:

- `tool_lead_captured` starts the appropriate general nurture path after the
  first verified eligible capture.
- `five_day_content_sprint_enrolled` starts the requested sprint.
- `ugc_app_ad_course_enrolled` starts the requested mini-course.
- `creative_testing_workshop_enrolled` starts the requested workshop delivery.

Every event has a durable ClipStitchr operation ID. Event properties use fixed
keys such as tool key, gate mode, and segment. They never contain the generated
answer or user-authored tool data. An explicit email-native enrollment creates
its own record and event; a general tool capture does not silently enroll all
three sequences.

Workflow idempotency is logical as well as operational. Convex stores one
enrollment record per contact, Workflow key, and Workflow version. A later tool
capture updates latest-tool and qualification properties without restarting the
same general nurture Workflow. An email-native experience can enroll the same
contact once per approved version. Re-entry requires a separately documented
product rule and a new enrollment generation; merely creating a new provider
operation ID is not permission to restart a sequence.

Where the Loops SDK permits it, the operation ID is also the provider
`Idempotency-Key`. A provider `409` for a previously accepted Workflow event or
transactional idempotency key is treated as previously accepted, not retried as
a new send; a contact-update `409` is not acceptance. Loops retains
idempotency keys for only twenty-four hours after the first provider attempt. An ambiguous operation may retry
with the same key only inside that provider window. Once the window expires, an
operation whose acceptance outcome is unknown moves to dead-letter for
inspection instead of being automatically replayed with a new key.

Provider acceptance is not inbox delivery. A successful SDK response or
duplicate-key `409` may mark an operation accepted. Only a matching
`email.delivered` webhook may mark an individual email delivered; bounce and
complaint webhooks record their own terminal delivery outcomes. An accepted
Workflow event does not prove that the Workflow selected or sent a message.

## Transactional Email Contract

Transactional email is reserved for an action-specific, non-promotional
message that is necessary to complete a user request or operate a paid account.
Potential future examples include:

- An account or security notification not already owned by Clerk.
- A paid-workflow completion or failure notice.
- A user-requested, non-promotional export-ready message.
- A billing notice not already owned by Stripe.

Welcome nurture, product education, lead-magnet follow-up, courses, workshops,
feature announcements, and paid-account invitations are not sent through the
transactional endpoint. Loops transactional messages do not include an
unsubscribe link and can reach a globally unsubscribed contact, although Loops
still blocks suppressed recipients. Misclassifying marketing as transactional
would therefore violate the approved trust and consent boundary.

Every transactional send must:

- Use a server-side allowlisted template key mapped to a Loops
  `transactionalId`; the browser never submits a provider template ID.
- Validate an operation-specific, bounded data-variable schema.
- Consume the applicable authenticated-user or recipient quota and a shared
  global email quota before the provider call.
- Use the durable operation ID as the provider idempotency key.
- Keep `addToAudience` false unless a separate contact-consent path already
  approved adding that recipient.
- Avoid attachments in the first implementation. Browser-local lead-magnet
  files stay browser-local unless a later privacy, retention, size, and abuse
  review approves attachment delivery.

## Reliability And Rate Limits

Loops documents a baseline API limit of ten requests per second per team and
returns `429` responses when that provider limit is exceeded. ClipStitchr
protects both its own send policy and the provider ceiling with these current
limits:

| Boundary | Current limit |
| --- | --- |
| Lead capture | 10/hour/client with burst 5; 3/hour/normalized email with burst 3; 500/hour globally with burst 100 across 5 shards |
| Browser-recognized interaction | 60/hour/token with burst 20; 120/hour/client with burst 30; 5,000/hour globally with burst 1,000 across 5 shards |
| Confirmation send | 3/day/email with burst 1; 5/hour/client with burst 2; 300/hour globally with burst 50 across 5 shards |
| Confirmation redeem | 10/hour/token with burst 5; 20/hour/client with burst 5; 2,000/hour globally with burst 200 across 5 shards |
| Email-native enrollment | 3/day/contact with burst 1; 10/hour/client with burst 3; 500/hour globally with burst 100 across 5 shards |
| Workflow event | 10/day/contact with burst 4; 2,000/hour globally with burst 400 across 5 shards |
| Transactional send | 10/day/contact with burst 3; 1,000/hour globally with burst 200 across 5 shards |
| Loops API pacing | 8 requests/second with initial capacity 2, below the provider's 10 requests/second/team ceiling |

All global ingress and send buckets use their documented shards. The
confirmation and email-native quotas are consumed in the canonical Convex
mutation before the matching outbox operation is created. Every initial Loops
call and retry separately consumes shared provider pacing immediately before
the official SDK call. Capacity exhaustion uses the limiter's returned retry
delay and does not consume one of the seven provider-attempt slots.

Ingress fairness and abuse quota is consumed in Convex before an operation is
created. Separately, every initial SDK call, retry, or deliberately approved
replay must consume the shared Loops provider-pacing bucket immediately before
the call. A retry does not consume a second user acquisition allotment, but it
does consume provider pacing. The Loops API's own `429` is a third safety
boundary, not ClipStitchr's primary abuse control. Authorization, consent,
ownership, template allowlists, and suppression handling remain separate from
quota.

No raw name, email, API key, signing secret, or message body is written to
general application logs. Support records prefer contact and operation IDs.

Provider operations use a four-minute claim lease and at most seven attempts.
Retryable network errors, provider `429` responses, and provider `5xx`
responses wait 15, 30, 60, 120, 240, 480, then at most 960 seconds between
attempts. Workflow and transactional retries reuse the original operation ID as
the same provider idempotency key; contact updates reuse the stable `userId` and
bounded projection. A Loops `409` is treated as acceptance only for an existing
Workflow or transactional idempotent operation. Validation errors, contact
update conflicts, and other permanent `4xx` responses
dead-letter immediately. An acceptance-unknown operation cannot be
automatically replayed once its twenty-four-hour Loops idempotency window
expires.

## Failure Behavior

- A Loops outage does not remove a public result or browser unlock after the
  canonical Convex transaction succeeds.
- The UI may say that enrollment was received after durable queuing, but it may
  not claim that an email was delivered based on durable queuing or provider
  acceptance. Delivery status requires the matching webhook.
- An email-native enrollment failure remains visible to operations and retries
  automatically within the documented bound.
- A permanent provider failure does not loop forever. It enters dead-letter
  state with a safe error category. A known-unsent operation may be deliberately
  replayed by an authenticated administrative operation. An ambiguous send
  older than Loops' twenty-four-hour idempotency window cannot be blindly
  replayed; an operator must first confirm provider history and then explicitly
  create a new operation if safe.
- Atomic operation claims, terminal states, provider idempotency, and logical
  Workflow enrollments prevent duplicate sends across normal scheduler, action,
  webhook, and browser retries. An ambiguous provider outcome is surfaced
  rather than overstated as exactly-once delivery.
- An unsubscribe, hard bounce, or complaint stops later marketing operations
  even if older queued operations still exist. Dispatch rechecks eligibility
  and cancels stale queued work before the provider call.
- If an explicit resubscribe call was already in flight when canonical
  unsubscribe won, its rejected acceptance fence queues one opaque-user-ID
  `subscribed: false` correction. Privacy deletion instead cancels every
  non-delete operation and fences any started or acceptance-unknown call with
  one opaque-user-ID `contactDelete` compensation. Late acceptance or an
  ambiguous completion expedites that final delete.

## Environment And Provider Setup

The runtime uses these exact server-side variables and flags:

| Variable | Purpose and fail-closed rule |
| --- | --- |
| `PUBLIC_TOOL_GATE_ROLLOUT` | Strict JSON rollout object. Missing, malformed, unknown-key, duplicate-tool, unsupported-variant, or out-of-range input resolves every tool to `control`. |
| `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT` | Explicit app deployment intent shared by Next.js and Convex. It must be exactly `development` for local, development, and Vercel preview deployments or exactly `production` for production. Missing or invalid values disable dispatch. |
| `LOOPS_EMAIL_ENABLED` | Provider dispatch is requested only when its value is exactly `true`. |
| `LOOPS_API_KEY` | Private key used only by the server-side official SDK adapter. |
| `LOOPS_TEAM_ENVIRONMENT` | Must exactly match `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT`. A missing, invalid, or mismatched team value disables dispatch. |
| `LOOPS_DEVELOPMENT_RECIPIENTS` | Comma-separated, normalized allowlist required for a development Loops team. Development contact sync and sends reject every address outside it. |
| `LOOPS_SIGNING_SECRET` | Secret used to verify the raw-body HMAC on `/webhooks/loops`. |
| `LOOPS_WEBHOOKS_READY` | Must be exactly `true`, with a signing secret, before Workflow readiness can pass. |
| `LOOPS_CONTACT_PROPERTIES_READY` | Must be exactly `true` only after the built-in `source` property and five approved custom properties exist in the selected Loops team and a development contact projection is verified. |
| `LOOPS_WORKFLOWS_READY` | Must be exactly `true` after all required event-triggered marketing Workflows and unsubscribe behavior are verified. |
| `LOOPS_EMAIL_NATIVE_ENABLED` | Must be exactly `true` before the three email-native tools can leave control, and only becomes ready after confirmation, contact, webhook, and Workflow readiness all pass. |
| `LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID` | Server-only mapping for the sole approved `email-confirmation` transactional template. |
| `EMAIL_CONFIRMATION_TOKEN_SECRET` | Server-only HMAC secret used to sign the forty-eight-hour confirmation reference. |
| `NEXT_PUBLIC_SITE_URL` or `SITE_URL` | Absolute public origin used to build confirmation links. Configure one; the standard site URL resolver applies. |
| `RATE_LIMIT_API_SECRET` | Shared Next.js-to-Convex secret used by lead, interaction, and confirmation mutations after request validation. |
| `PRIVACY_DELETION_OPERATOR_SECRET` | Dedicated Convex operator secret for canonical marketing-contact privacy deletion. It must differ from public API, rate-limit, and Loops credentials. |

Readiness does not infer deployment intent from `NODE_ENV`. Vercel preview
functions can report `NODE_ENV=production`, so a preview must explicitly select
`development` and use the development Loops team and recipient allowlist. On
Vercel, `VERCEL_ENV` is an additional consistency guard: production accepts
only explicit production intent, while preview and development accept only
explicit development intent. An unknown non-empty Vercel environment also
fails closed. Convex must receive the explicit deployment value separately;
it does not inherit the Vercel runtime environment.

Privacy deletion is a separate operator path and remains available while email
dispatch is paused. It atomically removes local identity and recognition links,
then creates a durable Loops contact-deletion operation using only the opaque
`userId`. Delete operations use the normal provider pacing, lease, retry, and
dead-letter machinery but do not depend on `LOOPS_EMAIL_ENABLED`. See
`docs/backend/marketing-contact-privacy-deletion.md` for the bounded action,
retry states, and dedicated-secret contract.

The selected Loops team must also have a verified sending domain, sender
identity, reply-to policy, production unsubscribe footer, the approved contact
properties, the confirmation transactional template, and the four named
Workflows before a matching readiness flag is set. These provider assets are
operator prerequisites; this repository change does not create or prove them.

Use distinct development and production Loops accounts or teams so tests
cannot send to production subscribers. Loops permits one webhook endpoint per
account, so separate API keys inside one account are not sufficient isolation
unless an explicitly approved webhook router is introduced.

Secrets stay in deployment configuration and are never committed. Template IDs
may be server-side environment values or focused server constants, but they are
never accepted from a public request.

## Implemented Atomic File Shape

The implementation keeps provider, operation, webhook, confirmation, rollout,
and Convex responsibilities in focused files under their closest domains:

```text
web/
  convex/
    email/
      cancelEmailProviderOperationsForContact.ts
      claimEmailProviderOperation.ts
      enqueueContactDeleteCompensation.ts
      enqueueEmailProviderOperation.ts
      enqueueInitialContactDeleteOperation.ts
      getEmailProviderOperationKind.ts
      processEmailProviderOperation.ts
      recordEmailProviderOperationAccepted.ts
      recordEmailProviderOperationFailure.ts
      reconcileLoopsWebhookEvent.ts
      resumeHeldContactDeleteOperationsForContact.ts
    http.ts
    schema.ts
  lib/clipstitchr/email/
    contact/
      LeadSegment.ts
      LeadStage.ts
    confirmation/
      <one focused type, validator, signer, renderer, or handler per file>
    loops/
      createLoopsClient.ts
      createLoopsContactProperties.ts
      deleteLoopsContact.ts
      getLoopsPrivacyDeletionConfiguration.ts
      getLoopsReadiness.ts
      LoopsWorkflowEventName.ts
      LoopsTransactionalTemplateKey.ts
    operations/
      dispatchEmailProviderOperation.ts
      getEmailProviderRetryDecision.ts
    webhooks/
      verifyLoopsWebhookSignature.ts
      parseLoopsWebhookEvent.ts
      LoopsWebhookEvent.ts
  lib/clipstitchr/tools/catalog/rollout/
    parsePublicToolGateRollout.ts
    resolvePublicToolGateRollout.ts
    resolvePublicToolGateVariantForRequest.ts
  app/email/confirm/
    route.ts
```

Every component, function, type, validator, constant set, and action remains in
its own focused file under the nearest existing email or tool-lead domain.
Shared provider behavior is reused by public-tool nurture and later account
transactional email rather than duplicated per feature.

## Migration And Rollout

The code and data-model foundation is complete, but activation remains staged:

1. The canonical contact, consent, capture, interaction, recognition-token,
   provider-operation, Workflow-enrollment, confirmation-token,
   webhook-deduplication, and deletion-tombstone records are present.
2. The waitlist migration preserves the original source and timestamp and marks
   rows without new consent evidence as `consentUnknown` and
   `marketingEligible: false`. Running the migration is an explicit operator
   step; the implementation does not manufacture consent or enroll those rows.
3. The official SDK adapter, shared provider pacing, bounded retry state
   machine, development recipient allowlist, signed webhook reconciliation,
   and app-owned confirmation path are present and covered by local tests.
4. All tools remain `control` unless `PUBLIC_TOOL_GATE_ROLLOUT` parses as the
   exact JSON contract below. An invalid value always fails to control.
5. Development contact sync, confirmation, Workflow, unsubscribe, duplicate,
   and retry smokes must pass against a separate development Loops team before
   any production allocation is nonzero.
6. Production starts with a named subset of the fixed fifty-tool catalog and a
   low allocation. Expand tools or percentage only after metrics and operational
   health are reviewed. The three email-native experiences remain control until
   `emailNativeReady` passes in addition to rollout assignment.

`PUBLIC_TOOL_GATE_ROLLOUT` accepts exactly this shape and no additional keys:

```json
{"variant":"hybrid-v1","tools":["app-hook-generator"],"allocationPercent":1}
```

- `variant` must be exactly `hybrid-v1`.
- `tools` must contain unique keys from the fixed fifty-tool catalog; it may be
  an empty list for an inert configuration.
- `allocationPercent` must be an integer from `0` through `100`.
- Assignment uses an opaque, one-year, HttpOnly visitor cookie and a stable
  10,000-bucket hash. A person remains in the same percentage cohort without
  placing identity or submitted tool data in the rollout key.
- A tool not listed, a visitor without a valid opaque key, a zero allocation,
  or any malformed configuration receives `control`.
- Lead capture itself also fails back to control without
  `EMAIL_CONFIRMATION_TOKEN_SECRET`. Email-native tools additionally require
  the full Loops `emailNativeReady` chain.

The app-owned forty-eight-hour confirmation remains required even though Loops
dashboard double opt-in is disabled. Loops' API contact operations bypass the
form-only double-opt-in behavior, so disabling the dashboard option neither
confirms nor weakens ClipStitchr's own consent step.

## Verification Contract

Focused automated tests cover the rollout parser and stable assignment,
browser-recognition rotation, canonical lead transactions, confirmation token
rotation and redemption guards, provider projections, official SDK calls,
allowlists, readiness, retry decisions, leases, webhook body/signature parsing,
and the direct confirmation route. The following contract remains the release
bar; provider-dashboard and deployed smokes are intentionally still
outstanding:

- Contact tests prove new and existing emails return the same public response,
  preserve first and latest attribution, and store required consent evidence.
- Transaction tests prove a contact, capture, unlock hash, outbox operation, and
  scheduler request commit together or not at all.
- Provider tests mock the official SDK and prove only allowlisted operations and
  bounded properties leave Convex.
- Retry tests cover network errors, `429`, retryable `5xx`, permanent `4xx`,
  duplicate idempotency `409`, the twenty-four-hour idempotency boundary,
  ambiguous outcomes, lease expiry, maximum attempts, and dead-letter state.
- Enrollment tests prove one contact cannot start the same Workflow version
  twice and later tool captures update segmentation without restarting nurture.
- Rate-limit tests prove every provider operation consumes the correct local
  quotas before the SDK call.
- Webhook tests verify the raw-body signature, timestamp window, body cap,
  event allowlist, schema version, duplicate `Webhook-Id`, unsubscribe,
  mailing-list changes, deletion, hard bounce, complaint behavior, and
  out-of-order event precedence. A forced failure between receipt and state
  application proves that the processed marker rolls back and redelivery can
  apply the event.
- Consent tests prove normal synchronization omits `subscribed` and later tool
  use cannot silently resubscribe an opted-out contact. Dispatch tests recheck
  current eligibility, cancel stale queued marketing, enforce contact-sync
  dependencies, and prevent a deleted or tombstoned contact from being
  recreated.
- Verification tests prove browser unlock does not wait for an inbox click,
  unverified contacts cannot enter marketing Workflows, confirmation tokens are
  hashed, expire after forty-eight hours, rotate on resend, are single-use and
  non-enumerating, scheduled arguments contain no bearer token, retries
  reproduce the same signed URL, a `GET` has no side effect, only a protected
  user `POST` confirms, the page leaks no referrer or analytics data, superseded
  operations cannot send old links, and confirmation sends are independently
  rate-limited.
- Marketing-versus-transactional tests prove nurture and educational sequences
  cannot use a transactional template.
- Privacy tests prove tool inputs, results, media, raw unlock tokens, and PII do
  not enter analytics or general logs.
- Before production enablement, run an end-to-end development smoke for contact
  sync, one Workflow event, the confirmation transactional template,
  unsubscribe reconciliation, and duplicate-send prevention. Development must
  use a separate Loops account or team and webhook endpoint from production.
  This smoke was not run as part of the implementation change.

## Revisit Triggers

Re-evaluate the community component only if a later stable release provides all
of the following without weakening the app-owned boundary:

- Current official Loops API coverage needed by ClipStitchr.
- Idempotency controls for events and transactional sends.
- Signed webhook ingestion and deduplication hooks.
- A way to avoid or cleanly reconcile duplicate contact storage.
- Atomic integration with ClipStitchr's existing rate limiter.
- A migration path that is simpler than retaining the official SDK adapter.

Until then, the official SDK adapter is the locked implementation direction.

## Decision Log

| Decision | Alternatives considered | Reason |
| --- | --- | --- |
| Select Loops for marketing and future transactional email. | Keep the provider undecided or adopt separate marketing and transactional providers immediately. | One provider can cover the approved nurture Workflows and bounded future transactional uses while the app is still small. |
| Use an app-owned Convex adapter over the official `loops` SDK. | Mount `@devwithbobby/loops` or write raw HTTP calls throughout the app. | The adapter keeps current API coverage and a replaceable boundary while preserving ClipStitchr's own durability, consent, and quota rules. |
| Keep Convex as the canonical contact and operation store. | Treat Loops or the component table as the only source of truth. | Tool attribution, browser unlock, consent evidence, retries, and paid conversion belong to the product data model. |
| Queue provider work after the canonical write. | Block the public response on Loops. | Tool value and consent evidence must survive a provider outage, and the user should not wait on an external marketing API. |
| Use signed, idempotent webhooks to reconcile opt-outs and failures. | Poll Loops or leave Convex stale. | Consent and suppression changes must stop future marketing sends promptly and safely. |
| Combine atomic local operation claims with Loops' twenty-four-hour idempotency window. | Depend only on provider idempotency or retry ambiguous sends indefinitely. | Local state prevents concurrent dispatch, while an expired ambiguous outcome is surfaced instead of risking a duplicate email. |
| Track provider acceptance separately from delivery. | Treat an API success or duplicate-key response as inbox delivery. | Workflows may filter a contact and accepted messages may still bounce; delivery is known only from the matching webhook. |
| Require an explicit confirmation POST after a no-side-effect GET. | Confirm consent as soon as the email link is fetched. | Email security scanners routinely follow links and must not grant marketing consent for the recipient. |
| Store one enrollment per contact, Workflow, and version. | Treat every capture event as permission to restart nurture. | Operation idempotency cannot prevent two distinct valid events from restarting the same sequence. |
| Recheck consent and deletion state immediately before marketing dispatch. | Trust the state captured when work was queued. | An unsubscribe or deletion that arrives while work is waiting must cancel that work rather than recreate or message the contact. |
| Keep nurture and email-native education on marketing Workflows. | Send requested courses or follow-up through transactional templates. | These messages contain ongoing educational or promotional content and must honor unsubscribe. |
| Omit `subscribed` during normal contact sync. | Send `subscribed: true` on every capture or update. | A retry or later tool interaction must not reverse an opt-out. Explicit re-consent is a separate operation. |
| Unlock immediately but verify a new address before marketing starts. | Withhold the lead magnet until an inbox click, trust API-created contacts as double-opted-in, or begin nurture from every syntactically valid address. | The result remains trustworthy and low-friction while the actual nurture audience contains confirmed recipients. |
| Keep browser-generated artifacts local initially. | Upload tool results or attach files to emails. | The hybrid gate can deliver value without expanding data retention, bandwidth, privacy, or abuse surface. |

## Sources

- [Loops official JavaScript SDK](https://loops.so/docs/sdks/javascript)
- [Loops API rate limits](https://loops.so/docs/api-reference/intro#rate-limiting)
- [Loops update-or-create contact endpoint](https://loops.so/docs/api-reference/update-contact)
- [Loops contact properties and subscription warning](https://loops.so/docs/contacts/properties)
- [Loops double opt-in scope](https://loops.so/docs/contacts/double-opt-in)
- [Loops event API and idempotency](https://loops.so/docs/api-reference/send-event)
- [Loops transactional API and idempotency](https://loops.so/docs/api-reference/send-transactional-email)
- [Loops marketing-versus-transactional guidance](https://loops.so/docs/guides/transactional-vs-marketing-email)
- [Loops signed webhook contract](https://loops.so/docs/webhooks)
- [Evaluated Convex component page](https://www.convex.dev/components/devwithbobby/loops)
- [Evaluated component source and API coverage](https://github.com/robertalv/loops)
- [Evaluated component client option types](https://github.com/robertalv/loops/blob/main/src/client/index.ts)
- [Evaluated component provider actions](https://github.com/robertalv/loops/blob/main/src/component/actions.ts)
- `docs/features/public-tool-lead-capture-strategy.md`
- `docs/backend/rate-limits.md`
