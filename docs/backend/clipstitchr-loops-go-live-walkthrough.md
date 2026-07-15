# ClipStitchr Loops Go-Live Walkthrough

Reviewed: 2026-07-15

## What This Guide Is For

This is the plain-English checklist and completion record for ClipStitchr's
email setup. The application code, provider assets, production configuration,
and full public rollout are implemented and verified.

You do not need to write code. When a step says **Ask Codex**, give the approval
shown in that step and Codex can perform the technical work. A deployment,
real email, Workflow start, migration, commit, push, or pull request must never
happen unless you explicitly approve that exact action.

## Current Safe State

**FollowUs AI** is the isolated development Loops environment and
**ClipStitchr** is the isolated production Loops environment. Development
validation, the production provider assets, application deployment, legacy
waitlist migration, Workflow activation, controlled Workflow-event smoke, and
full public rollout are complete.

| Asset | Current state |
| --- | --- |
| Environment separation | Distinct API keys, audiences, templates, Workflows, domains, and webhooks verified |
| Six contact fields | Created and verified by name and type in both environments |
| Confirmation emails | Published, confirmation-only, and limited to `confirmationUrl` |
| Production marketing Workflows | Four exact ClipStitchr Workflows Active with zero sends; unrelated fifth Workflow remains Draft |
| Sending domains | `mail.followusai.com` and `mail.clipstitchr.com` verified |
| Production webhook | Configured at the production Convex site and signed smoke-tested |
| Production application | Convex and Vercel deployed; `clipstitchr.com` is live |
| Controlled production confirmation | Passed once; sender, content, production origin, 48-hour lifetime, explicit POST, and single use verified |
| Legacy production waitlist | Two records migrated as consent-unknown, unverified, unsubscribed, and marketing-ineligible; no send or enrollment created |
| Controlled production contact projection | Passed once with the exact approved fields; no mailing list, Workflow event, or forbidden lead data created |
| Production sending and readiness | All five gates are exactly `true` in Convex and Vercel |
| Public gate rollout | All 50 fixed tools use `hybrid-v1` at 100%, including three email-native tools |
| Production deployment | `dpl_2mEbfiVggjYyyPCj2jWutnJtQxGG` is Ready and owns the production aliases |
| Provider queue | No held, pending, processing, or dead-letter operations |

Current FollowUs AI development provider IDs:

| Asset | Provider ID |
| --- | --- |
| Transactional group | `cmrk2s70j0csq0jxxwng33rqn` |
| Confirmation template | `cmrk2s9a001bh0j2xe7ykklh4` |
| Published confirmation message | `cmrk4b58l0fr60jzqnyjxgnot` |
| General nurture Workflow | `cmrk3btgq0dec0iyeq1sp5hxl` |
| Sprint Workflow | `cmrk3edej0dwe0j36wgugcd8o` |
| Mini-course Workflow | `cmrk3g0cf0dwv0jxz6lq99gmn` |
| Workshop Workflow | `cmrk3hfml0drr0jxxluu90yr1` |

Do not treat FollowUs AI as ClipStitchr production. It may be used only for
allowlisted development testing.

## Your Next Three Actions

The setup is live. The remaining work is normal operation:

1. Watch provider errors, retries, dead letters, bounces, complaints,
   unsubscribes, and webhook failures.
2. Keep the two migrated legacy contacts excluded unless each person completes
   the app-owned confirmation flow.
3. Use the emergency-stop steps below if delivery or consent behavior looks
   wrong.

## Phase 1: Keep Everything Safe

- [x] Keep every production ClipStitchr Workflow in **Draft** until its
  separately approved July 15 activation.
- [x] Leave `LOOPS_EMAIL_ENABLED=false`.
- [x] Leave `LOOPS_WEBHOOKS_READY=false`.
- [x] Leave `LOOPS_CONTACT_PROPERTIES_READY=false` until a real production
  contact projection has been checked.
- [x] Leave `LOOPS_WORKFLOWS_READY=false`.
- [x] Leave `LOOPS_EMAIL_NATIVE_ENABLED=false`.
- [x] Leave `PUBLIC_TOOL_GATE_ROLLOUT` blank.
- [x] Do not paste an API key, signing secret, confirmation link, or operator
  secret into chat, a Git file, an issue, or a shared document.

The Loops dashboard's double-opt-in setting should remain disabled. ClipStitchr
uses its own 48-hour, single-use confirmation link, so changing the Loops form
setting would not replace the app's confirmation flow.

## Phase 2: Confirm the Environment Split

The required separation is:

| Purpose | Loops account/team | Allowed audience |
| --- | --- | --- |
| Development | FollowUs AI | No-delivery addresses and explicitly allowlisted inboxes you control |
| Production | ClipStitchr | Confirmed ClipStitchr subscribers only |

This gives development and production separate API keys, audiences, sending
domains, and webhook endpoints.

### Step 1: Lock FollowUs AI to development

- [✅] Keep every ClipStitchr asset clearly named or grouped as ClipStitchr.
- [✅] Never import production ClipStitchr subscribers into FollowUs AI.
- [✅] Use a dedicated alias such as `yourname+clipstitchr-dev@yourdomain.com`
  for the one real development inbox test.
- [✅] Check that no existing FollowUs Workflow has a broad active trigger that
  would capture the development test contact.
- [✅] Configure the FollowUs AI webhook only with the development Convex URL.

### Step 2: Reserve ClipStitchr for production

- [✅] Do not copy development contacts from FollowUs AI into ClipStitchr.
- [✅] Do not point the ClipStitchr webhook at a development deployment.
- [✅] Recreate only the verified properties, template, Workflows, and settings
  when development testing is complete.
- [✅] If you need to connect or switch to the production account, use the
  [Loops team switcher guide](https://loops.so/docs/account/team-switcher).

## Phase 3: Finish the FollowUs AI Development Team

Complete this phase in **FollowUs AI**.

### Step 3: Finish the development sending domain

Current development domain: `mail.followusai.com`.

- [✅] Open **Settings -> Domain**.
- [✅] Click **View records**.
- [✅] In the DNS provider that controls `followusai.com`, add or verify every
  SPF, DKIM, MX, and DMARC record exactly as Loops shows it.
- [✅] If you do not control DNS, send the records to the person who does and
  wait for them to confirm the change.
- [✅] Include the MX priority exactly as shown.
- [✅] Do not invent an A or CNAME record for the subdomain; Loops supplies the
  records it needs.
- [✅] Return to Loops and click **Verify Records**.
- [✅] Wait until every required record is verified before any real test email.

Official guide: [Setting up a Loops sending domain](https://loops.so/docs/sending-domain).

### Step 4: Verify the FollowUs AI development API key

- [✅ ] Keep using the FollowUs AI key already stored in the ignored
  `web/.env.local` file for development only.
- [✅] Confirm it is also stored in the approved development secret store.
- [✅] Do not paste it into this file or send it in chat.
- [✅] Tell Codex only that the key has been stored and which environment owns
  it.

Verify the existing keyring selection:

```bash
loops auth status
```

Confirm that the status names **FollowUs AI** before allowing any
CLI-based provider check. If it does not, use `loops auth list` and
`loops auth use <existing-followus-key-name>` to select the already-stored key.
Do not put the key directly in a shell command.

Official guide: [Loops API authentication](https://loops.so/docs/api-reference/intro).

### Step 5: Verify the six contact fields

`source` is built into Loops. Do not create a second `source` field.
ClipStitchr supplies the fixed value `ClipStitchr public tools` when it projects
a contact.

These five custom fields already exist as **String** fields. Verify their exact
names and types; do not create duplicates:

- [✅] `contactName`
- [✅] `firstTool`
- [✅] `latestTool`
- [✅] `leadSegment`
- [✅] `leadStage`

View them under **Settings -> API -> Contact properties** or in the Audience
table. Use **Add property** only if an approved field is genuinely missing.
Loops does not let you rename or change a property's type later, so check the
spelling before saving.

Official guide: [Loops contact properties](https://loops.so/docs/contacts/properties).

### Step 6: Review the existing confirmation email

The existing development transactional template is
`cmrk2s9a001bh0j2xe7ykklh4`. Verify it still meets every requirement:

- [✅] Use sender name `ClipStitchr`.
- [✅] Use sender username `clipstitchr`.
- [✅] Use reply-to `support@followusai.com`.
- [✅] Explain that the link expires after 48 hours.
- [✅] Include only one data variable: `confirmationUrl`.
- [✅] Keep it operational and non-promotional.
- [✅] Do not add nurture copy, a product pitch, attachments, open tracking, or
  click tracking.
- [✅] Keep the published version available for the controlled development test.
- [✅] Confirm `LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID` uses this development
  template ID.

ClipStitchr sends this message with `addToAudience: false`; the confirmation
email itself must not add the person to the marketing audience.

Official guide: [Loops transactional email](https://loops.so/docs/transactional).

### Step 7: Review the four existing marketing Workflows

Each Workflow must use an **Event received** trigger and must be configured to
start only once for the current Workflow version.

- [✅] General nurture trigger: `tool_lead_captured`.
- [✅] Sprint trigger: `five_day_content_sprint_enrolled`.
- [✅] Mini-course trigger: `ugc_app_ad_course_enrolled`.
- [✅] Workshop trigger: `creative_testing_workshop_enrolled`.
- [✅] Confirm every marketing email includes Loops unsubscribe handling.
- [✅] Confirm no Workflow uses the transactional confirmation template.
- [✅] Keep all four Workflows in **Draft**.

The FollowUs AI drafts have already been created and audited. Do not recreate
them. Keep them in Draft until the separately approved Workflow test.

#### Keep Styled mode or deliberately convert to Plain

Treat **Styled** and **Plain** as two alternative final designs for an email.
The existing dark ClipStitchr drafts were designed and reviewed in Styled
mode, so keeping them Styled is the lowest-risk choice for this batch.

When an email is switched to Plain, Loops removes the email's base theme but
can retain formatting applied directly to individual sections and blocks. A
dark section background can therefore remain while its text returns to the
Plain-mode default of black. That makes the text appear to disappear.

If a future email is intentionally converted to Plain, fix one email fully
before changing the rest:

- [✅] Select the dark **Section** itself so the section outline is visible.
- [✅] Under **Section -> Background**, reset or clear the color so the section
  inherits the Plain email background. Prefer reset/clear over hard-coding a
  color; use `#FFFFFF` only when Loops does not offer a clear option.
- [✅] Set the section border width to `0` unless a border is intentionally part
  of the Plain design.
- [✅] Under **Block styles -> Background**, clear any second background color.
- [✅] Select the text inside the section and reset its text color to the
  default, or set it to `#000000` for a white background.
- [✅] Repeat this check for every callout, card, button, and colored section.
- [✅] Send controlled previews to inboxes you own in Apple Mail and Gmail, and
  check both light and dark device modes before approving the conversion.

Do not switch all 15 existing emails to Plain as a quick deliverability
toggle. Either keep the current batch Styled, or convert and verify each email
as a separate design change. Switching modes auto-saves the draft, so leave
the Workflows in Draft throughout this review.

Official guides: [Workflows](https://loops.so/docs/workflows) and
[Workflow triggers](https://loops.so/docs/workflows/triggers). See also
[Styling emails](https://loops.so/docs/creating-emails/styles) and
[Email dark mode](https://loops.so/docs/guides/email-dark-mode).

## Phase 4: Prepare the Development Deployment

### Step 8: Choose safe test inboxes

- [✅] Choose one inbox you control for a later real-email test.
- [✅] Use an address at `example.com` or `test.com` for the first no-delivery
  Workflow movement test. Loops documents that these domains do not receive
  actual email.
- [✅] Because development shares FollowUs AI's sending reputation, perform only
  one real-inbox confirmation test after every no-delivery check passes.
- [✅] Store the comma-separated allowlist as
  `LOOPS_DEVELOPMENT_RECIPIENTS` in development only.
- [✅] Do not add customer or production addresses to this allowlist.

### Step 9: Create the missing privacy operator secret

- [✅] Generate a high-entropy secret with a password manager or secret manager.
- [✅] Use at least 32 random bytes.
- [✅] Save it directly as `PRIVACY_DELETION_OPERATOR_SECRET` in the Convex
  development environment.
- [✅] Do not reuse the Loops API key, webhook secret, or rate-limit secret.
- [✅] Do not paste the value into chat.

### Step 10: Give explicit development deployment approval

When the development team, API key, domain, fields, template, and draft
Workflows are ready, send Codex this exact instruction:

> Deploy the current ClipStitchr Convex development functions only. Do not
> deploy production, send an email, start a Workflow, migrate contacts, commit,
> push, or create a PR. After deployment, report the exact development webhook
> URL and stop.

Expected development webhook after deployment:

```text
https://neighborly-beagle-365.convex.site/webhooks/loops
```

Do not enter this URL in Loops before the matching Convex functions are
deployed and reachable.

### Step 11: Set development environment values

Set secrets directly in the Vercel development/preview environment and the
Convex development environment where each value is required. Convex does not
inherit Vercel environment variables.

| Variable | Where it belongs | Development value before smoke |
| --- | --- | --- |
| `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT` | Vercel and Convex | `development` |
| `LOOPS_TEAM_ENVIRONMENT` | Vercel and Convex | `development` |
| `LOOPS_API_KEY` | Vercel and Convex secret storage | Development-team secret |
| `LOOPS_DEVELOPMENT_RECIPIENTS` | Vercel and Convex | Controlled addresses only |
| `LOOPS_SIGNING_SECRET` | Vercel and Convex secret storage | Blank until Step 12, then the dashboard-issued development webhook secret |
| `LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID` | Vercel and Convex | Development template ID |
| `EMAIL_CONFIRMATION_TOKEN_SECRET` | Vercel and Convex secret storage | The same existing high-entropy app secret |
| `RATE_LIMIT_API_SECRET` | Vercel and Convex secret storage | The same existing app/Convex secret |
| `PRIVACY_DELETION_OPERATOR_SECRET` | Convex secret storage only | New dedicated secret |
| `NEXT_PUBLIC_SITE_URL` or `SITE_URL` | Vercel and Convex | Reachable development app origin |
| `LOOPS_EMAIL_ENABLED` | Vercel and Convex | `false` |
| `LOOPS_CONTACT_PROPERTIES_READY` | Vercel and Convex | `false` |
| `LOOPS_WEBHOOKS_READY` | Vercel and Convex | `false` |
| `LOOPS_WORKFLOWS_READY` | Vercel and Convex | `false` |
| `LOOPS_EMAIL_NATIVE_ENABLED` | Vercel and Convex | `false` |
| `PUBLIC_TOOL_GATE_ROLLOUT` | Vercel only | Blank |

## Phase 5: Configure and Test the Webhook

### Step 12: Add the webhook in Loops

After the development Convex deployment succeeds:

- [✅] In **FollowUs AI**, open **Settings -> Webhooks**.
- [✅] Enter the exact development webhook URL reported by Codex. <https://neighborly-beagle-365.convex.site/webhooks/loops>
- [✅] Copy the dashboard-issued signing secret directly into both required
  development server environments as `LOOPS_SIGNING_SECRET`.
- [✅] Replace any older local placeholder or non-dashboard signing-secret
  value.
- [✅] Do not paste the signing secret into chat.
- [✅] Subscribe to every available supported event listed below. The
  `testing.testEvent` event comes from Loops' webhook test button rather than a
  normal subscription toggle.
- [✅] Keep `LOOPS_WEBHOOKS_READY=false` until testing passes.

ClipStitchr supports these exact events:

```text
testing.testEvent
contact.created
contact.unsubscribed
contact.deleted
contact.mailingList.subscribed
contact.mailingList.unsubscribed
loop.email.sent
transactional.email.sent
email.delivered
email.softBounced
email.hardBounced
email.unsubscribed
email.resubscribed
email.spamReported
```

Loops currently permits one webhook endpoint per account and provides the
signing secret during setup. Official guide: [Loops webhooks](https://loops.so/docs/webhooks).

### Step 13: Approve the no-delivery smoke test

Send Codex this instruction:

> Run the development webhook and provider projection smoke tests using only
> `example.com` or `test.com` addresses. You may temporarily set
> `LOOPS_EMAIL_ENABLED=true` only for those allowlisted no-delivery addresses;
> return it to `false` before stopping. Do not send to a real inbox, start a
> Workflow, start the public rollout, migrate contacts, deploy production,
> commit, push, or create a PR. Report every check and stop.

The test must prove all of the following:

- [✅] A valid signed webhook returns `200`.
- [✅] Replaying the same webhook ID is harmless and still returns `200`.
- [✅] An invalid signature and stale timestamp return `401`.
- [✅] Unsupported data returns `400`.
- [✅] A body over 64 KiB returns `413`.
- [✅] The projected contact contains only the approved fields.
- [✅] No tool answer, upload, media detail, token, IP address, or analytics ID
  appears in Loops.
- [✅] A confirmation-link `GET` does not confirm the contact.
- [✅] Only the explicit same-origin confirmation `POST` confirms the contact.
- [✅] Repeated events do not restart the same Workflow.
- [✅] Unsubscribe, bounce, complaint, and deletion events stop later marketing.

Only after these checks pass may `LOOPS_CONTACT_PROPERTIES_READY` and
`LOOPS_WEBHOOKS_READY` become `true`.

### Step 14: Approve one real development email

This is the first step that sends an actual email. It needs a separate, explicit
approval.

Send Codex this instruction only when you are ready:

> Send one development confirmation email to my controlled allowlisted inbox.
> Do not send any marketing email, start a Workflow, enable the public rollout
> migrate contacts, deploy production, commit, push, or create a PR.
> Verify the confirmation flow and stop.

Then personally check:

- [✅] The sender says ClipStitchr.
- [✅] The subject and preview text are clear.
- [✅] The message contains no promotional nurture.
- [✅] The link uses the correct development app origin.
- [✅] The link expires after 48 hours.
- [✅] Clicking the link only opens the confirmation page.
- [✅] Pressing the confirmation button completes consent once.
- [✅] The email has no unexpected tracking or attachment.

Verified in development on 2026-07-14 using the controlled Gmail connector and
the local confirmation route. The no-side-effect `GET` preserved pending
consent, the explicit CSRF-protected `POST` confirmed it, and a replay returned
the unavailable page. The confirmation message was delivered without an
attachment or tracking redirect. Dispatch was returned to disabled afterward;
the resulting contact-sync and Workflow-event operations remain held and were
not accepted by Loops.

### Step 15: Approve Workflow testing

- [✅] Review all 15 marketing emails in Loops.
- [✅] Check sender, reply-to, spelling, links, delays, and unsubscribe behavior.
- [✅] Use Loops preview messages or non-delivery test domains first.
- [✅] Approve a real marketing test only after confirmation and webhook tests
  pass.
- [✅] Start the development Workflows only after their trigger and unsubscribe
  behavior are proven.
- [✅] Set `LOOPS_WORKFLOWS_READY=true` only after those checks pass.
- [✅] Set `LOOPS_EMAIL_NATIVE_ENABLED=true` only after confirmation, contacts,
  webhooks, and all four Workflows are ready.

Verified in the FollowUs AI development team on 2026-07-14. The audit covered
all 15 Workflow messages, their ClipStitchr sender, FollowUs support reply-to,
subject and preview copy, spelling, seven unique destination links, timers, and
Loops' automatic marketing footer and Preference Center unsubscribe behavior.
All destination links returned `200`.

The four namespaced Workflows were started only in the development team and
were triggered with dedicated `example.com` contacts. General nurture placed
exactly one contact at its seven-day timer, even after a second accepted event
used a different idempotency key. The sprint and mini-course each recorded one
first message and queued one contact at the next-day timer. The workshop
recorded one message. A separate `subscribed: false` contact did not increase
the workshop send count. Loops documents `example.com` and `test.com` as
no-delivery Workflow test domains, so no marketing message reached a real
inbox. A real marketing test remains subject to separate explicit approval and
was not sent during this step.

Local and Convex development readiness now have
`LOOPS_WORKFLOWS_READY=true` and `LOOPS_EMAIL_NATIVE_ENABLED=true`.
`LOOPS_EMAIL_ENABLED=false` remains in place, and the public rollout remains
blank or unset.

Use a separate approval when you are ready to test Workflow movement:

> Start the four namespaced ClipStitchr development Workflows in FollowUs AI and
> test their exact event triggers using only allowlisted no-delivery addresses.
> Do not send to a real inbox, enable the public rollout, migrate contacts,
> deploy production, commit, push, or create a PR. Return
> `LOOPS_EMAIL_ENABLED` to `false` after testing and report the result.

## Phase 6: Migrate Legacy Waitlist Records (Completed in production)

This was completed after development smoke testing and before production
rollout activation.

- [x] Approve a Convex backup or snapshot.
- [x] Keep email dispatch disabled and the public rollout at control.
- [x] Send Codex this instruction:

> Back up the current Convex deployment, then run the secret-authorized legacy
> waitlist migration in pages of at most 50. Keep provider dispatch and rollout
> disabled. Do not send email, deploy production, commit, push, or create a PR.
> Report totals and verification results.

- [x] Verify migrated contacts are `consentUnknown`.
- [x] Verify they are unverified, unsubscribed, and
  `marketingEligible: false`.
- [x] Verify no migration-created confirmation, Workflow event, or Loops send
  exists.

Legacy contacts must confirm through the new app flow before receiving
marketing email.

Production migration evidence from July 14, 2026:

- Convex snapshot export `1784082310409867503` completed before the mutation;
  its downloaded archive passed an integrity check.
- The focused migration test passed 2 tests in 1 test file.
- The secret-authorized production mutation ran once, processed 2 rows, created
  2 canonical contacts and 2 consent records, and returned `isDone: true`.
- Both mappings are one-to-one and unique. Each migrated contact is
  `consentUnknown`, `unverified`, `notSubscribed`, and
  `marketingEligible: false`, with matching consent evidence.
- The two migrated contacts have zero confirmation tokens, recognition tokens,
  tool captures, mailing-list memberships, provider operations, and Workflow
  enrollments. The original 2 waitlist rows remain preserved.
- Convex and Vercel still have all five production send/readiness flags set to
  `false`; `PUBLIC_TOOL_GATE_ROLLOUT` remains unset.

## Phase 7: Set Up Production

Repeat the verified development setup inside the **ClipStitchr** production
account. Do not reuse the FollowUs AI API key, webhook secret, transactional ID,
audience, or Workflow IDs.

### Step 16: Configure production assets

- [x] Add and fully verify `mail.clipstitchr.com` or another approved production
  sending subdomain.
- [x] Generate a production-only API key.
- [x] Store it with `loops auth login prod`, select it with
  `loops auth use prod`, and verify that the reported team is `ClipStitchr`
  before any provider check.
- [x] Generate separate production values for
  `EMAIL_CONFIRMATION_TOKEN_SECRET`, `RATE_LIMIT_API_SECRET`, and
  `PRIVACY_DELETION_OPERATOR_SECRET`.
- [x] Set `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT=production` and
  `LOOPS_TEAM_ENVIRONMENT=production` in the production Vercel and Convex
  environments.
- [x] Keep all production readiness flags `false` and the rollout blank while
  setup and smoke testing are incomplete.
- [x] Create the built-in-plus-five contact field contract.
- [x] Recreate and publish the confirmation template.
- [x] Recreate all four marketing Workflows and leave them in Draft.
- [x] Review every production link and sender setting.
- [x] Ask Codex to confirm the production Convex site URL before entering a
  webhook URL. The current candidate is:

```text
https://whimsical-ptarmigan-764.convex.site/webhooks/loops
```

- [x] Configure the production webhook and store its production signing secret.
- [x] Run the same no-delivery and one-inbox smoke sequence.

Production setup evidence from July 14, 2026:

- The `prod` CLI alias resolves to the `ClipStitchr` team and uses an API key
  that is different from the FollowUs AI development key. The matching key is
  present in production Vercel and Convex.
- The three app secrets above were regenerated as distinct production-only
  values and stored as secrets in production Vercel and Convex.
- The production confirmation transactional ID is
  `cmrl8xajk07s90j2h8wkbwb7x`. It is published, requires only
  `confirmationUrl`, uses `notrack="true"`, and passed an `example.com`
  no-delivery send.
- The production webhook is enabled at
  `https://whimsical-ptarmigan-764.convex.site/webhooks/loops`. All three event
  groups are subscribed, the secret is present in both production secret
  stores, and the Loops dashboard recorded a signed test as `Success`.
- Direct production endpoint checks returned `200` for a valid signed event and
  its replay, `401` for invalid and stale signatures, `400` for unsupported
  data, and `413` for a body larger than 64 KiB.
- All 15 marketing messages match their verified development source content,
  use `ClipStitchr <clipstitchr@mail.clipstitchr.com>`, reply to
  `support@clipstitchr.com`, and link only to `https://clipstitchr.com` pages.
- At production setup time, the four Workflow structures were present and in
  Draft. Their names, one-time triggers, timer sequences, and message content
  were verified after the final dashboard rename.
- One controlled confirmation was sent to the approved production inbox. Gmail
  showed `ClipStitchr <clipstitchr@mail.clipstitchr.com>`, the expected subject
  and preview, confirmation-only copy, a `https://clipstitchr.com` link, a
  stated 48-hour lifetime, no attachment, and no tracking wrapper around the
  confirmation button.
- The signed `GET` showed the confirmation form without changing consent. The
  explicit same-origin, CSRF-checked `POST` confirmed consent once, and a replay
  showed the non-enumerating unavailable page. The token is used and the
  transactional operation is delivered.
- `NEXT_PUBLIC_SITE_URL=https://clipstitchr.com` is now present in production
  Convex as well as Vercel. The initial zero-attempt configuration failure was
  recovered with the guarded internal-only recovery mutation; no second
  contact, token, provider attempt, or email was created.
- The resulting contact-sync and `tool_lead_captured` Workflow operations are
  held with zero attempts. No Loops audience contact or Workflow event was
  created. All five production send/readiness flags are `false` and
  `PUBLIC_TOOL_GATE_ROLLOUT` is unset in both Convex and Vercel.

### Step 17: Give separate production approval

When every production prerequisite is ready, send Codex a narrowly scoped
deployment request. A useful starting instruction is:

> Deploy the verified ClipStitchr email integration to production with email
> dispatch and public rollout still disabled. Do not send email, start a
> Workflow, migrate contacts, commit, push, or create a PR. Verify readiness and
> stop.

Deployment approval is not email-send approval, and email-send approval is not
Workflow-start or rollout approval.

- [x] Run the focused email, confirmation, provider, and webhook test suites.
- [x] Pass TypeScript, lint, and the production build.
- [x] Deploy the Convex functions to production.
- [x] Deploy the Next.js application to production.
- [x] Verify the production confirmation route is live and fail-closed without
  a valid signed reference.
- [x] Verify all five production send and readiness flags remain `false`.
- [x] Verify `PUBLIC_TOOL_GATE_ROLLOUT` remains unset.
- [x] Do not send email, start a Workflow, migrate contacts, commit, push, or
  create a pull request during this deployment step.

Step 17 deployment evidence from July 14, 2026:

- The focused email integration run passed 271 tests across 69 files.
- The full coverage-enabled repository run passed 2,712 tests across 798 test
  files after deployment.
- `npm run typecheck` passed. `npm run lint` completed with no errors and 26
  existing test-only unused-parameter warnings. The production Next.js build
  passed locally and again on Vercel.
- Convex schema validation passed and the production functions deployed to
  `https://whimsical-ptarmigan-764.convex.cloud`.
- Vercel production deployment `dpl_FdagodyZgXGB4LQy84ejRzQMFWfi` reached
  `Ready` and owns the `https://clipstitchr.com` and
  `https://www.clipstitchr.com` aliases.
- The deployed privacy page now describes requested Loops email without the
  obsolete pre-smoke claim that no live Loops message had ever been sent.
- `https://clipstitchr.com/email/confirm` returns the fail-closed **Link
  unavailable** page when no signed reference is supplied. The response uses
  private `no-store`, `Referrer-Policy: no-referrer`, a script-blocking content
  security policy, frame denial, and no third-party resources.
- Both Convex and Vercel still have `LOOPS_EMAIL_ENABLED`,
  `LOOPS_CONTACT_PROPERTIES_READY`, `LOOPS_WEBHOOKS_READY`,
  `LOOPS_WORKFLOWS_READY`, and `LOOPS_EMAIL_NATIVE_ENABLED` set to `false`.
  `PUBLIC_TOOL_GATE_ROLLOUT` remains unset.
- The Step 17 post-deployment audit, before the later separately approved
  migration, found exactly two untouched legacy waitlist rows and zero
  canonical email records. The only two webhook deduplication records were the
  expected `testing.testEvent` smoke events.
- No real or marketing email was sent, no Workflow was started, no contact was
  migrated during the deployment step, and no commit, push, or pull request was
  created.

Production contact-projection evidence from July 15, 2026:

- The focused contact-property and contact-upsert tests passed 3 tests across 2
  test files.
- The `prod` CLI alias resolved to the ClipStitchr team before the provider
  write. The controlled address did not already exist in that Loops audience.
- ClipStitchr's application-owned `upsertLoopsContact` helper projected only
  the already-confirmed controlled test contact. No bulk resume command or
  global readiness gate was used.
- The resulting Loops record exactly matches Convex for email, provider user
  ID, contact name, source, first tool, latest tool, lead segment, and lead
  stage. It has no mailing-list membership or unexpected property.
- No tool answer, upload, media detail, confirmation token, IP address, or
  analytics identifier appears in the provider projection.
- The durable contact-sync and `tool_lead_captured` Workflow-event operations
  remain held with zero attempts. The Workflow enrollment remains pending; no
  provider event or marketing email was sent.
- All five Convex and Vercel production send/readiness flags remain `false`,
  and `PUBLIC_TOOL_GATE_ROLLOUT` remains unset.

Production Workflow activation evidence from July 15, 2026:

- The `prod` CLI alias resolved to the ClipStitchr team. CLI inspection verified
  all four namespaced Workflow IDs, exact one-time event triggers, node order,
  timer sequence, email subjects, and message counts before activation.
- The four approved Workflows are Active: General tool nurture, 5-Day Content
  Sprint, UGC App Ad Course, and Creative Testing Workshop. Each still reports
  zero sends, opens, and clicks.
- The unrelated `Turn Raw Clips Into Polished TikTok & Reels Ads` Workflow was
  not changed and remains Draft.
- No event was sent and no held operation was resumed. The controlled
  contact-sync and `tool_lead_captured` operations remain held at zero attempts,
  and the enrollment remains pending.
- All five Convex and Vercel production send/readiness flags remain `false`,
  and `PUBLIC_TOOL_GATE_ROLLOUT` remains unset.

## Phase 8: Complete the Public Rollout (Released at 100%)

Production confirmation, contact projection, webhook, and Workflow smoke tests
all passed before release. The operator explicitly chose a direct 100% release
instead of gradual percentage steps.

### Step 18: Enable readiness in order

- [x] Set `LOOPS_EMAIL_ENABLED=true` after explicit production-send approval.
- [x] Set `LOOPS_CONTACT_PROPERTIES_READY=true` after the production
  contact projection is verified.
- [x] Set `LOOPS_WEBHOOKS_READY=true` after signed webhook tests pass.
- [x] Start the four production Workflows only after their final review.
- [x] Set `LOOPS_WORKFLOWS_READY=true` after their triggers and
  unsubscribe behavior are verified.
- [x] Set `LOOPS_EMAIL_NATIVE_ENABLED=true` after the confirmation, contact,
  webhook, and Workflow readiness chain passed.

### Step 19: Release the full catalog

- [x] Record the operator's explicit choice to skip gradual percentages.
- [x] Configure all 50 unique fixed tool keys at 100%.
- [x] Include the three email-native tools only after email-native readiness is
  true.
- [x] Deploy the exact production configuration and verify the production
  aliases.
- [x] Verify `hybrid-v1` on every live tool route with a fresh opaque visitor
  identity; 50 of 50 passed.
- [x] Verify there are no held, pending, processing, or dead-letter provider
  operations after release.
- [ ] Continue watching acceptance, confirmation, provider errors, retries,
  dead letters, webhook failures, bounces, complaints, and unsubscribes as an
  ongoing operational task.
- [x] Never treat provider acceptance as delivery; only the signed
  `email.delivered` webhook proves delivery.

Example one-tool rollout configuration:

```json
{
  "variant": "hybrid-v1",
  "tools": ["app-hook-generator"],
  "allocationPercent": 1
}
```

The production value uses the same strict shape with all 50 unique catalog
keys and `"allocationPercent":100`. The one-tool example remains useful for an
emergency or future isolated rollout; it is not the current production value.

Full-release evidence from July 15, 2026:

- Six focused files passed 43 tests for catalog coverage, rollout parsing and
  assignment, Loops readiness, held-operation resume, and provider processing.
- The controlled event smoke resumed exactly one contact sync and one
  `tool_lead_captured` event. Both were accepted on attempt one, the enrollment
  became accepted, and the controlled contact entered the seven-day timer.
- All five Convex and Vercel production sending/readiness values are exactly
  `true`; the Vercel values were checked for exact string equality before the
  production rebuild.
- Deployment `dpl_2mEbfiVggjYyyPCj2jWutnJtQxGG` reached Ready and owns
  `clipstitchr.com`, `www.clipstitchr.com`, and the production Vercel aliases.
- A fresh opaque visitor cookie received `hybrid-v1` on all 50 live routes,
  including all three email-native routes. The audit found zero route failures.
- The provider outbox contains one delivered transactional operation, one
  accepted contact sync, and one accepted Workflow event, all at one attempt.
  It contains no held, pending, processing, or dead-letter operation.
- The controlled contact is confirmed, verified, subscribed, and eligible.
  The two legacy contacts remain consent-unknown, unverified, unsubscribed, and
  ineligible, with no token, capture, provider operation, or enrollment.

## Emergency Stop

If anything looks wrong:

1. Remove `PUBLIC_TOOL_GATE_ROLLOUT` or set its allocation to `0`.
2. Set `LOOPS_EMAIL_ENABLED=false` to stop new provider dispatch.
3. Keep the webhook URL and signing secret active so unsubscribes, complaints,
   bounces, and deletion events still reconcile.
4. Do not delete queued operations or generate new idempotency keys.
5. Ask Codex to inspect held and dead-letter operations before resuming.

## You Are Finished When

- [x] FollowUs AI is verified and used only for development.
- [x] ClipStitchr is verified and used only for production.
- [x] `mail.followusai.com` and the chosen ClipStitchr production sending domain
  are fully verified.
- [x] Each team has its own API key, template ID, Workflow IDs, and webhook
  signing secret.
- [x] All six approved contact fields exist in each team.
- [x] The development and production no-delivery smoke tests pass.
- [x] One controlled confirmation email succeeds in each environment.
- [x] One controlled production contact projection contains only the approved
  fields and does not start a Workflow.
- [x] The four namespaced production Workflows are Active with zero sends, and
  no event was dispatched during activation.
- [x] Unsubscribe, bounce, complaint, deletion, and delivery reconciliation are
  proven.
- [x] The two legacy production waitlist rows are migrated without inferred
  consent, provider activity, or Workflow enrollment.
- [x] Legacy contacts remain ineligible until they confirm.
- [x] The explicitly approved production rollout includes all 50 tools at 100%.
- [x] Every deployment, send, Workflow start, migration, and rollout has its own
  explicit approval record.

## Related Documentation

- [Official Loops documentation index](https://loops.so/docs/llms.txt)
- `docs/backend/public-tool-email-rollout-runbook.md`
- `docs/backend/loops-email-integration.md`
- `docs/backend/marketing-contact-privacy-deletion.md`
- `docs/backend/rate-limits.md`
- `docs/features/public-tool-lead-capture-strategy.md`
