# Public Tool Email Rollout Runbook

Reviewed: 2026-07-15

## Current Status

The public-tool gate, canonical Convex contact model, browser unlock,
app-owned email confirmation, durable provider outbox, official Loops SDK
adapter, and signed webhook handler are implemented. Provider dispatch and all
50 gate variants fail closed when their required configuration is missing or
invalid.

The FollowUs AI team is the isolated development environment and the
ClipStitchr team is the isolated production environment. Both have the approved
contact fields, confirmation template, marketing Workflow structures, verified
sender domain, API key, and signed webhook. Development confirmation and
provider smoke checks passed. Production provider assets, Convex functions,
and the Vercel application are deployed. One separately approved production
confirmation completed the signed-link `GET`, explicit same-origin `POST`, and
single-use replay checks. A separately approved migration preserved both legacy
waitlist rows as consent-unknown, unverified, unsubscribed, and ineligible, with
no provider operation or Workflow enrollment. A controlled production contact
projection also passed through the application-owned Loops helper with the
exact approved fields. After separate approval, the four namespaced production
Workflows were reviewed and activated. The unused duplicate signup Workflow was
deleted after its zero-send Draft state was verified.

The controlled `tool_lead_captured` smoke resumed exactly two zero-attempt
operations once: one contact sync and one Workflow event. Both were accepted on
their first attempt, the enrollment became accepted, and the general nurture
Workflow began its seven-day timer without sending an immediate marketing
email. On July 15, 2026, the operator explicitly chose a direct full release
instead of this runbook's recommended gradual percentages. Convex and Vercel
now have all five production sending/readiness flags set to exactly `true`.
Production deployment `dpl_2mEbfiVggjYyyPCj2jWutnJtQxGG` is Ready, and its
strict rollout contains all 50 unique tool keys at 100%, including the three
email-native tools. A live route audit returned `hybrid-v1` for all 50 tools
with zero failures. The two legacy contacts remain marketing-ineligible and
have no provider operations, tokens, captures, or Workflow enrollments.

The staged instructions below remain the recommended procedure for future
rollout changes. The production launch record above documents the operator's
explicitly approved exception.

FollowUs AI development asset inventory:

| Asset | Provider ID or state |
| --- | --- |
| ClipStitchr transactional group | `cmrk2s70j0csq0jxxwng33rqn` |
| `email-confirmation` transactional template | `cmrk2s9a001bh0j2xe7ykklh4` |
| Published confirmation message | `cmrk4b58l0fr60jzqnyjxgnot` |
| `tool_lead_captured` Workflow | `cmrk3btgq0dec0iyeq1sp5hxl` (configured) |
| `five_day_content_sprint_enrolled` Workflow | `cmrk3edej0dwe0j36wgugcd8o` (configured) |
| `ugc_app_ad_course_enrolled` Workflow | `cmrk3g0cf0dwv0jxz6lq99gmn` (configured) |
| `creative_testing_workshop_enrolled` Workflow | `cmrk3hfml0drr0jxxluu90yr1` (configured) |
| Shared sender domain | `mail.followusai.com`; verified |
| Development webhook | `https://neighborly-beagle-365.convex.site/webhooks/loops`; configured and smoke-tested |
| Production webhook | `https://whimsical-ptarmigan-764.convex.site/webhooks/loops`; configured and smoke-tested |

These development IDs are an operator record, not permission to use FollowUs AI
as production. The ClipStitchr account uses independently recreated production
assets and production-only IDs.

Loops dashboard double opt-in is disabled. That setting does not replace or
remove ClipStitchr's forty-eight-hour, single-use app confirmation. Loops API
contact calls bypass the form-only double-opt-in behavior, so the app requires a
no-side-effect `GET` followed by an explicit same-origin, CSRF-checked `POST`
before a new or returning opted-out address can enter marketing Workflows.

## Safety Model

- Convex is the source of truth for contact, consent, attribution, recognition,
  enrollment, provider-operation, delivery, and deletion state.
- The official `loops` JavaScript SDK is the only provider client. The browser
  never calls Loops and cannot choose an event or template ID.
- Browser value unlocks after the canonical Convex transaction. It does not
  wait for provider acceptance or an inbox click.
- Provider operations run from a durable outbox with a four-minute lease, at
  most seven attempts, stable contact identity, the same event or transactional
  idempotency key, and no automatic replay of an ambiguous send after Loops'
  twenty-four-hour idempotency window.
- Normal contact projection omits `subscribed`. App-confirmed re-consent uses a
  dedicated `subscribed: true` operation, and a raced resubscribe is repaired by
  one deduplicated opaque-user-ID `subscribed: false` correction.
- `POST /webhooks/loops` on the Convex HTTP origin reconciles opt-out,
  suppression, deletion, mailing-list, send, bounce, complaint, and delivery
  state. Keep this path available even when new dispatch is paused.
- All fifty tools default to `control`. The catalog contains 16 `open-result`,
  13 `useful-preview`, 18 `gated-portability`, and 3 `email-native` contracts.
  A rollout can select only fixed catalog keys; unknown tools never enter the
  experiment.

## Use Separate Development And Production Accounts

Use FollowUs AI for development and the separate ClipStitchr account for
production. Do not use two API keys in one team as the isolation boundary.
Loops supports one webhook endpoint per account, and development testing must
not share a subscriber audience or webhook state with production.

In each team, create and verify these six contact properties before setting
`LOOPS_CONTACT_PROPERTIES_READY=true`:

| Property      | Expected value                                      |
| ------------- | --------------------------------------------------- |
| `source`      | Fixed string `ClipStitchr public tools`             |
| `contactName` | Submitted name without guessing first and last name |
| `firstTool`   | First fixed public-tool key                         |
| `latestTool`  | Most recent fixed public-tool key                   |
| `leadSegment` | One approved segment key                            |
| `leadStage`   | One approved stage key                              |

Also configure and verify:

1. A sending domain, sender identity, reply-to policy, and unsubscribe footer.
2. One transactional template for the server key `email-confirmation`. It must
   accept only `confirmationUrl`, contain no promotional nurture, and remain
   private to the server mapping. The adapter always sets `addToAudience` to
   `false`.
3. Four marketing Workflows triggered by these exact event names:
   - `tool_lead_captured`
   - `five_day_content_sprint_enrolled`
   - `ugc_app_ad_course_enrolled`
   - `creative_testing_workshop_enrolled`

4. Unsubscribe handling in every marketing email. The sprint, course, workshop,
   welcome, nurture, and product invitation are marketing messages and must not
   use the transactional template.
5. A webhook pointing to the selected deployment's Convex site origin plus
   `/webhooks/loops`. Save its signing secret only in server deployment
   configuration.

Do not set a readiness flag because a dashboard asset was merely created. Set
it only after its behavior is verified in the matching Loops team.

## Environment Contract

Every boolean flag is enabled only by the exact lowercase string `true`.
Anything else is false. Secrets must never be committed, printed in test output,
or placed in a `NEXT_PUBLIC_` variable.

`NODE_ENV` is not the deployment selector. Vercel preview functions commonly
run with `NODE_ENV=production`, so previews must explicitly use
`CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT=development` and a development Loops team.
As an additional fail-closed check, `VERCEL_ENV=production` accepts only the
explicit production value, while `VERCEL_ENV=preview` or `development` accepts
only the explicit development value. Configure the explicit value in both
Next.js and Convex because Convex provider actions do not inherit Vercel
environment variables.

| Variable                                    | Required value and scope                                                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_TOOL_GATE_ROLLOUT`                  | Next.js server. Strict JSON with exactly `variant`, `tools`, and `allocationPercent`. Omit it for the safest control state.                                                              |
| `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT`        | Next.js server and Convex. Exactly `development` for local, development, and Vercel preview deployments; exactly `production` only for production. Missing or invalid values disable dispatch. |
| `LOOPS_EMAIL_ENABLED`                       | Next.js server readiness and Convex dispatch. Set to `true` only after the matching team is ready.                                                                                       |
| `LOOPS_API_KEY`                             | Server-side key for the selected Loops team. Convex uses it for dispatch; the Next.js server also needs the readiness value for email-native gating. Never expose it to client code.     |
| `LOOPS_TEAM_ENVIRONMENT`                    | Must exactly match `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT`. A missing, invalid, or mismatched value disables dispatch.                                                                       |
| `LOOPS_DEVELOPMENT_RECIPIENTS`              | Required comma-separated allowlist in development. Include only controlled test inboxes. Development adapter calls reject every other address.                                           |
| `LOOPS_SIGNING_SECRET`                      | Signing secret for the matching team's `/webhooks/loops` endpoint. Required in Convex; also present in Next.js readiness configuration before email-native rollout.                      |
| `LOOPS_WEBHOOKS_READY`                      | `true` only after valid, invalid, stale, duplicate, and reconciliation tests pass.                                                                                                       |
| `LOOPS_CONTACT_PROPERTIES_READY`            | `true` only after all six bounded properties above exist and a development projection is verified.                                                                                       |
| `LOOPS_WORKFLOWS_READY`                     | `true` only after all four exact events, unsubscribe behavior, and the selected team are verified.                                                                                       |
| `LOOPS_EMAIL_NATIVE_ENABLED`                | `true` only after the entire confirmation, contact, webhook, and Workflow chain passes. It is the final gate for the three email-native tools.                                           |
| `LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID` | Server-side Loops ID for the confirmation template. The browser never submits this value.                                                                                                |
| `EMAIL_CONFIRMATION_TOKEN_SECRET`           | High-entropy server secret used to sign confirmation references. Configure the same value in the Next.js server and Convex deployment that create, dispatch, inspect, and redeem links.  |
| `NEXT_PUBLIC_SITE_URL` or `SITE_URL`        | One absolute public app origin used by the standard site resolver to create confirmation links. Do not use a preview or localhost origin in production.                                  |
| `RATE_LIMIT_API_SECRET`                     | Same high-entropy secret in Next.js and Convex. It authorizes the app's secret-gated lead, interaction, enrollment, and confirmation mutations; it does not authenticate Loops webhooks. |
| `PRIVACY_DELETION_OPERATOR_SECRET`           | Convex only. A separate high-entropy operator secret for reviewed marketing-contact deletion requests. Never reuse the Loops API key or expose it to a browser.                            |

The readiness ladder is cumulative:

1. `dispatchEnabled` requires email enabled, API key, an explicit deployment
   environment, the exact matching Loops team environment, Vercel consistency
   when applicable, and the development allowlist when applicable.
2. `contactSyncReady` adds verified contact properties.
3. `confirmationReady` adds the confirmation token secret, transactional ID,
   and site URL.
4. `webhookReady` requires the signing secret and webhook-ready flag.
5. `workflowReady` requires dispatch, contact properties, webhook readiness,
   and the Workflow-ready flag.
6. `emailNativeReady` requires confirmation and Workflow readiness plus the
   email-native flag.

Do not start a nonzero public rollout merely because browser unlock works. Have
at least `confirmationReady`, `contactSyncReady`, and `workflowReady` in the
selected team first so accepted requests do not create provider work that is
immediately dead-lettered for incomplete configuration.

If a confirmation operation dead-letters for configuration with zero provider
attempts, fix the missing configuration first. An administrator may then invoke
the internal `email/requeueZeroAttemptConfigurationFailure` mutation for that
specific operation. It refuses any operation with an attempted, ambiguous,
accepted, delivered, expired, used, or superseded outcome. Never use it to
replay an uncertain provider result.

## Strict Fifty-Tool Rollout

The rollout parser accepts one exact JSON object:

```json
{
  "variant": "hybrid-v1",
  "tools": ["app-hook-generator"],
  "allocationPercent": 1
}
```

- `variant` must equal `hybrid-v1`.
- `tools` is a unique list of fixed public-tool catalog keys. An empty list is
  valid and inert. Duplicate or unknown keys invalidate the whole object.
- `allocationPercent` is an integer from `0` through `100`.
- Extra or missing object keys invalidate the whole object.
- Assignment uses a one-year, opaque, HttpOnly visitor cookie and a stable
  10,000-bucket hash. No identity, tool input, result, filename, or media detail
  enters the assignment key.
- Invalid configuration, a missing or invalid visitor key, an unlisted tool,
  or zero allocation returns `control`.
- The three email-native tools return `control` unless `emailNativeReady` is
  also true. Lead capture falls back to control if the confirmation signing
  secret is absent.

Use this inert value only when an explicit variable is operationally easier
than leaving it unset:

```json
{ "variant": "hybrid-v1", "tools": [], "allocationPercent": 0 }
```

## Legacy Waitlist Migration

Run `migrations/migrateWaitlistContacts:migrateWaitlistContacts` only as a
secret-authorized operator after taking the normal Convex backup or snapshot.
Keep the public rollout at control and provider dispatch disabled during the
migration.

- Pass Convex pagination options and `RATE_LIMIT_API_SECRET` through the secure
  operator runner. Do not place the real secret in a committed script or shared
  shell history.
- The mutation caps each page at 50 waitlist rows and returns
  `continueCursor`, `isDone`, processed count, and created contact and consent
  counts. Continue with the returned cursor until `isDone` is true.
- Re-running a page is safe: the migration keys contacts and consent evidence
  to the legacy waitlist row and does not create provider operations.
- Verify migrated rows preserve the available source and original timestamp,
  use `consentUnknown`, remain unverified and not subscribed, and set
  `marketingEligible: false`.
- Do not infer consent, send confirmation automatically, sync the contact, or
  enroll a migrated address. It must complete the new app confirmation before
  becoming eligible for marketing.

Production execution evidence from July 14, 2026:

- Snapshot export `1784082310409867503` completed before migration and the
  downloaded archive passed an integrity check.
- One mutation page processed 2 rows, created 2 contacts and 2 consent records,
  and returned `isDone: true`.
- A read-only audit verified one-to-one mappings, preserved waitlist rows, safe
  ineligible states, and zero migration-created tokens, captures, memberships,
  provider operations, or Workflow enrollments.
- Convex and Vercel send/readiness gates remained `false`, and the public
  rollout remained unset.

## Automated Checks Before Provider Setup

Run from `web/` with no live Loops credentials:

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

At minimum, confirm the focused suites for catalog rollout, lead capture,
recognition, contact transactions, confirmation, readiness, SDK dispatch,
retry decisions, operation claims, rate limits, webhook verification, webhook
parsing, and webhook reconciliation pass. These checks prove the app boundary;
they do not prove a Loops dashboard template or Workflow.

## Development Team Smoke

Use only controlled addresses listed in `LOOPS_DEVELOPMENT_RECIPIENTS`.

1. Keep the rollout unset or at zero while validating the deployment's
   readiness output and signed webhook endpoint.
2. Send one valid Loops test webhook. Confirm `200`, one deduplication record,
   and no raw body or secret in logs. Replay the same `Webhook-Id` and confirm
   idempotent `200`.
3. Confirm an invalid signature returns `401`, a timestamp more than five
   minutes away returns `401`, an unsupported schema or event returns `400`,
   and a body over 64 KiB returns `413` without state changes.
4. Set a single non-email-native tool to 100 percent only for a controlled test
   browser. Submit one allowlisted inbox and confirm the public response is
   exactly `{ "accepted": true }` and browser value appears before any email.
5. Confirm the contact receives only `email`, opaque `userId`, `source`,
   `contactName`, `firstTool`, `latestTool`, `leadSegment`, and `leadStage`.
   Confirm tool inputs, generated results, media details, IP data, raw tokens,
   and analytics IDs are absent.
6. Confirm the operational confirmation email uses the configured template,
   only the `confirmationUrl` variable, `addToAudience: false`, and the durable
   operation ID as `Idempotency-Key`.
7. Fetch the link with `GET` and confirm consent stays pending. Press the form
   button and confirm only the same-origin CSRF-checked `POST` verifies consent,
   upserts the contact, and starts `tool_lead_captured` once. Confirm the local,
   hosting, and edge request logs do not contain the confirmation query string
   or signed reference.
8. Repeat the capture and retry the same provider operation. Confirm no Workflow
   restart and no duplicate email. Confirm Loops `409` for the same idempotency
   key is treated as accepted, not sent again.
9. Trigger unsubscribe, hard-bounce, spam-report, mailing-list, deletion, and
   delivery test events. Confirm canonical status changes, newer restrictive
   state wins over delayed permissive events, and later marketing operations
   cancel before provider dispatch.
10. Submit an opted-out address again. Confirm normal contact sync never sends
    `subscribed: true`; only a new successful app confirmation creates the
    dedicated resubscribe operation. Race that operation against a newer local
    unsubscribe in development and confirm exactly one opaque-user-ID
    unsubscribe correction is queued; then confirm the correction cancels if
    the contact explicitly re-consents before it dispatches.
11. Exercise one email-native tool only after the prior checks pass. Confirm its
    exact Workflow starts once after confirmation and does not silently enroll
    either of the other two sequences.
12. Return the rollout to zero when the smoke is complete and review every
    accepted, canceled, superseded, retried, and dead-letter operation.

Record the team, deployment, date, test recipient, operation IDs, webhook IDs,
and pass/fail outcome without copying an API key, signing secret, full email
body, confirmation URL, or raw bearer token into the record.

## Production Rollout

1. Recreate and independently verify the approved properties, transactional
   template, four Workflows, sender configuration, unsubscribe behavior, and
   signed webhook in the separate production Loops team.
2. Configure production secrets and readiness flags. Keep
   `PUBLIC_TOOL_GATE_ROLLOUT` unset until the production webhook smoke succeeds.
3. Start with one non-email-native tool at 1 percent. Do not begin with all
   fifty tools or an email-native sequence.
4. Review opaque acceptance rate, confirmation request and redeem rate,
   provider `429` and `5xx` counts, retries, dead letters, webhook failures,
   bounce and complaint signals, unsubscribe behavior, and paid-CTA movement.
5. Increase percentage in deliberate steps such as 1, 5, 10, 25, 50, then 100.
   Add one typed tool group at a time. A percentage change does not authorize a
   new tool key, and adding a tool key does not authorize email-native delivery.
6. Enable the three email-native keys one at a time only after the general
   nurture path remains healthy and `emailNativeReady` is true in both server
   environments.
7. Do not call provider acceptance “delivered.” Only a matching signed
   `email.delivered` webhook changes individual delivery state.

## Pause And Rollback

1. Set the rollout allocation to `0`, use an empty tool list, or remove
   `PUBLIC_TOOL_GATE_ROLLOUT` to return all new visitors to control.
2. If provider calls must stop, set `LOOPS_EMAIL_ENABLED` to a value other than
   `true`. Do not remove the webhook signing secret or block the webhook route;
   unsubscribe and suppression reconciliation must continue.
3. Existing canonical captures and queued operations remain in Convex. Do not
   delete them, reset idempotency keys, or blindly replay an acceptance-unknown
   operation. Due pending operations move to `held` instead of creating a retry
   loop while dispatch is off.
4. Inspect dead letters and provider history. An operation older than the
   twenty-four-hour idempotency window requires an explicit safety decision
   before any new operation is created.
5. After readiness is deliberately restored, invoke
   `email/resumeHeldEmailProviderOperations:resumeHeldEmailProviderOperations`
   through the secure Convex operator runner with `RATE_LIMIT_API_SECRET` and a
   current `resumedAt` timestamp. Repeat only while `hasMore` is `true`; each
   call resumes at most fifty operations.
6. A rollback of the gate does not revoke browser-local value already earned.

## Related Documentation

- `docs/operations/email/loops-go-live.md`
- `docs/operations/email/integration.md`
- `docs/operations/security/rate-limits.md`
- `docs/features/public-tools/portfolio/public-tool-lead-capture-strategy.md`
- `docs/features/public-tools/portfolio/public-tool-quality-register.md`
- `docs/integrations/analytics/posthog.md`
- `docs/integrations/analytics/tiktok.md`
