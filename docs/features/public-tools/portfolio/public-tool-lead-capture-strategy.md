# Public Tool Lead-Capture Strategy

## Status

This document records the approved acquisition design for ClipStitchr's fifty
public app-marketing tools. The design was approved on July 13, 2026, and its
catalog, browser-unlock, confirmation, analytics, and rollout foundations are
now implemented behind a fail-closed control.

The shipped foundation includes:

- Typed metadata assigning all fifty tools to the exact approved gate mode and
  value contract.
- A server-controlled `control` versus `hybrid-v1` rollout that requires an
  explicit tool allowlist, allocation, approved variant, and opaque visitor
  key. Missing or invalid configuration stays in control.
- A shared name-and-email form that unlocks approved browser-local value after
  the server returns the same opaque accepted response for every contact
  state.
- A non-identifying browser-only unlock marker plus an opaque 180-day
  recognition token in an HttpOnly, same-site cookie. Page scripts cannot read
  that token, and the server stores only its digest and contact association.
- A standalone app-owned confirmation page whose scanner-safe `GET` cannot
  record consent. Only its explicit same-origin, CSRF-protected `POST` can use a
  valid forty-eight-hour, single-use confirmation.
- A fixed public-tool analytics boundary that excludes contact details, token
  values, tool inputs, and results.
- Route integration for all fifty tools, including the exact thirteen useful
  previews and all eighteen catalog-matched Markdown, CSV, or print
  portability actions.

This does not silently turn on all fifty gates. Current routes retain their
complete control experience unless an implemented, functional value seam is
explicitly selected for `hybrid-v1`. The three email-native routes derive
readiness on the server and fail closed to their complete browser-local control
experience unless the full Loops contract and rollout selection are present.
No Loops dashboard configuration or live email send was performed as part of
this implementation.
`docs/operations/email/integration.md` remains the source of truth for the
provider boundary.

## Goals

The goals are ordered deliberately:

1. Grow organic search traffic and establish trust with app founders and app
   marketers.
2. Grow a qualified mailing list from people who receive real value from a
   tool.
3. Convert engaged subscribers into paid ClipStitchr customers.

Raw form submissions are not the primary success measure. Tool completion,
repeat use, deeper tool intent, product interest, and eventual paid conversion
determine whether the captured leads are useful.

ClipStitchr will not add a free product tier. Public resources may diagnose,
plan, calculate, organize, teach, or prepare production work. Stitching,
transcoding, finished-ad export, and the persistent media workspace remain paid
product jobs.

## Governing Principle

Never gate the answer a visitor searched for. Gate the next level of
usefulness.

- A calculator exposes its complete calculation.
- A checker exposes its technical verdict.
- A generator exposes several usable outputs.
- A collection remains useful and browsable on its public page.
- Name and email may unlock a deeper report, complete plan, reusable export, or
  guided experience.

Every page must expose useful, crawlable explanations, examples, instructions,
FAQs, and related resources. The form is an inline next step after value, not a
full-page interruption.

## Gating Model

| Mode | Count | Public value | Name-and-email exchange |
| --- | ---: | --- | --- |
| Open core result | 16 | Complete answer, verdict, estimate, or recommendation | Optional companion resource, saved report, or relevant mailing-list path |
| Useful preview | 13 | A complete and independently useful portion of the personalized result | Remaining depth, variations, or implementation detail |
| Open resource with gated portability | 18 | The complete resource remains usable or browsable on the page | Downloadable, copyable, saved, or editable version |
| Email-native experience | 3 | Curriculum, outcomes, examples, and locked lesson titles | Access to the selected course, sprint, or workshop after explicit confirmation |

The four groups cover all fifty portfolio numbers exactly once.

`publicToolGateCatalog.ts` now encodes this mapping and each tool's public
value, unlocked value, outcome CTA, and supported artifact or email Workflow
contract. Catalog metadata does not activate a gate by itself: rollout remains
control unless the route has a functional unlock and the server explicitly
selects the approved variant.

## Open Core Results

These sixteen tools answer immediate search intent. Their complete core result
remains visible without contact information.

| # | Catalog capability | Catalog key | Complete public value | Optional name-and-email benefit |
| ---: | --- | --- | --- | --- |
| 8 | What Should I Post? Decision Tree | `what-should-i-post-decision-tree` | Final recommendation | Downloadable Markdown seven-day prompt pack |
| 21 | 9:16 App Demo Video Checker | `9-16-app-demo-video-checker` | Verdict and detected issues | Downloadable Markdown fix report |
| 22 | App-Ad Dead-Space Finder | `app-ad-dead-space-finder` | Complete review visualization | Downloadable Markdown timestamp review |
| 25 | TikTok Safe-Zone Overlay | `tiktok-safe-zone-overlay` | Complete obstruction overlay | Static PNG safe-zone reference files, never an export of the visitor's image |
| 26 | App Video Compression Estimator | `app-video-compression-estimator` | Complete size and transfer estimate | Downloadable Markdown settings guide |
| 27 | Short-Form Video Specs Cheat Sheet | `short-form-video-specs-cheat-sheet` | All maintained specifications | Print-ready reference view |
| 28 | Clip Naming System Generator | `clip-naming-system-generator` | Complete naming system | Downloadable Markdown naming template |
| 32 | Ad Variant Calculator | `ad-variant-calculator` | Complete calculation | CSV creative-testing worksheet |
| 33 | App-Ad Creative Fatigue Calculator | `app-ad-creative-fatigue-calculator` | Complete scenario estimate | CSV rotation worksheet |
| 34 | App UGC Production Cost Calculator | `app-ugc-cost-calculator` | Complete cost breakdown | CSV budget worksheet |
| 35 | App Ad Cost per Creative Calculator | `app-ad-cost-per-creative-calculator` | Complete calculation | CSV scenario worksheet |
| 36 | App Ad Break-Even Calculator | `app-ad-break-even-calculator` | Complete break-even result | CSV scenario worksheet |
| 37 | App-Ad Creative Testing Budget Planner | `app-ad-testing-budget-planner` | Complete budget allocation | CSV testing schedule |
| 38 | UGC Creator Rate Comparison Worksheet | `ugc-creator-rate-comparison-worksheet` | Complete entered-quote comparison | Downloadable Markdown negotiation worksheet |
| 39 | Client Content Capacity Calculator | `client-content-capacity-calculator` | Complete capacity estimate | CSV planning calendar |
| 50 | Interactive ClipStitchr Savings Report | `clipstitchr-savings-report` | Complete scenario result | Downloadable Markdown scenario report and contextual paid-account path |

An optional benefit must exist and work before its CTA appears. A page must not
promise a report, pack, worksheet, or saved result that has not been built.

## Useful Preview Gates

These thirteen tools produce divisible personalized results. The public preview
must be useful by itself and must accurately demonstrate the quality of the
complete result.

| # | Catalog capability | Catalog key | Visible before signup | Unlocked after required name and email |
| ---: | --- | --- | --- | --- |
| 1 | 30-Day Short-Form Content Plan for App Founders | `30-day-app-content-plan` | Strategy, content pillars, and first seven days | Remaining twenty-three days and Markdown plan download |
| 5 | App Ad Shot List Generator | `app-ad-shot-list-generator` | Essential shots and their purpose | Complete production-ready shot list and Markdown download |
| 11 | App Hook Generator | `app-hook-generator` | Three complete hooks | All eight hooks and copy control |
| 12 | Hook Strength Grader for App Ads | `app-ad-hook-grader` | Score and most important fix | Dimension breakdown and rewrite plan |
| 13 | App Ad Hook Rewrite Tool | `app-ad-hook-rewriter` | Two complete rewrites | All six rewrites and testing angles |
| 15 | Hook-to-Visual Matchmaker for App Ads | `hook-to-visual-matchmaker` | Best match and explanation | Alternative matches and testing notes |
| 23 | Product Demo Readiness Checker | `product-demo-readiness-checker` | Verdict and largest blocker | Complete prioritized remediation result |
| 24 | App UGC Clip Readiness Checker | `app-ugc-clip-readiness-checker` | Readiness status and top issue | Complete clip-readiness result |
| 31 | App Ad Creative Test Plan Generator | `app-ad-test-plan-generator` | Hypothesis and first test wave | Full matrix, schedule, and budget result |
| 41 | Personalized Short-Form Content Audit | `personalized-short-form-content-audit` | Score and first priority | Complete audit and fourteen-day plan |
| 47 | UGC Ad Brief Builder for Apps | `app-ugc-brief-builder` | Brief summary | Complete creator handoff and Markdown copy |
| 48 | App Ad Creative Testing Blueprint Builder | `app-ad-creative-testing-blueprint-builder` | Testing lanes and first experiment | Complete testing blueprint |
| 49 | Raw Clips to Campaign Planner | `raw-clips-to-campaign-planner` | Strongest clip combination | Complete reuse and missing-capture plan |

## Open Resources With Gated Portability

These eighteen resources remain complete and usable on their public pages.
Required name and email unlock convenience: a file, completed export, editable
copy, or organized collection.

| # | Catalog capability | Catalog key | Available on the page | Unlocked after required name and email |
| ---: | --- | --- | --- | --- |
| 2 | 100 Hooks for App Demo Videos | `100-app-demo-video-hooks` | Complete searchable collection | CSV hook library |
| 3 | App UGC Ad Brief Template | `app-ugc-ad-brief-template` | Complete interactive template | Markdown brief download |
| 4 | Product Demo Recording Checklist | `app-demo-recording-checklist` | Complete checklist | Print-ready checklist view |
| 6 | TikTok and Reels Creative Testing Tracker | `tiktok-reels-creative-testing-tracker` | Complete on-page tracker | CSV tracker export |
| 7 | UGC Creator Handoff Kit | `ugc-creator-handoff-kit` | Complete instructions and examples | Markdown handoff download |
| 9 | App Marketing Content Calendar | `app-marketing-content-calendar` | Complete calendar | CSV calendar export |
| 10 | Short-Form Ad Preflight Checklist | `short-form-ad-preflight-checklist` | Complete checklist | Print-ready checklist view |
| 14 | 50 App-Ad Hook Structures | `app-ad-hook-structures` | Complete searchable collection | CSV swipe file |
| 16 | UGC Opening-Line Prompt Cards | `ugc-opening-line-prompt-cards` | Complete browsable card set | Print-ready card view |
| 17 | App Category Hook Packs | `app-category-hook-packs` | Complete browsable packs | CSV category-pack collection |
| 18 | Competitor Hook Research Worksheet | `competitor-hook-research-worksheet` | Complete worksheet | Markdown research download |
| 19 | App Hook Testing Matrix | `app-hook-testing-matrix` | Complete matrix | CSV matrix export |
| 20 | Why Did This Ad Work? Breakdown Template | `why-did-this-ad-work-template` | Complete analysis framework | Markdown teardown download |
| 29 | App Raw Footage Intake Checklist | `app-raw-footage-intake-checklist` | Complete checklist | Markdown intake-form download |
| 30 | App Creative Asset Inventory Template | `app-creative-asset-inventory-template` | Complete inventory | CSV inventory export |
| 40 | Short-Form Campaign Retrospective Template | `short-form-campaign-retrospective-template` | Complete retrospective flow | Markdown retrospective download |
| 45 | Short-Form Content System Notion-Ready Kit | `short-form-content-system-notion-kit` | Complete system explanation and examples | Five importable CSV files |
| 46 | App Ad Teardown Library | `app-ad-teardown-library` | Complete individual public teardowns | Markdown library export |

## Email-Native Experiences

The typed catalog, shared resource boundaries, and server-derived enrollment
endpoint recognize these three email-native experiences. Their routes evaluate
the full Loops readiness contract. Course lesson bodies stay server-side until
the visitor explicitly confirms that exact course. When readiness and the
approved rollout select `hybrid-v1`, the explicit form is visible. A verified
app-owned course session may also request another catalog-defined course with
one click; the client cannot choose a Workflow key, token, or contact.

| # | Catalog capability | Catalog key | Public landing-page value | Future delivered experience |
| ---: | --- | --- | --- | --- |
| 42 | Five-Day App Content Sprint | `five-day-app-content-sprint` | Curriculum, outcomes, and locked day titles | Five-message guided sequence and app-owned progress |
| 43 | UGC-to-App-Ad Mini-Course | `ugc-to-app-ad-mini-course` | Curriculum and locked lesson titles | Five-lesson sequence and app-owned progress |
| 44 | Build Your First Creative Testing System Workshop | `app-creative-testing-system-workshop` | Agenda, outcomes, and locked section titles | Full self-guided workshop and Markdown workbook |

Activating these entry gates still requires verified Loops readiness, consent
and unsubscribe handling, delivery retries, rate limits before each provider
operation, bounce handling, failure monitoring, and a functional enrollment
control. A generic browser-local unlock never reveals course content, enrolls a
sequence, or removes the explicit enrollment form. Development and production
provider assets remain separate, and the approved production rollout uses the
same exact-course entitlement checks.
Loops dashboard double opt-in is disabled and, in any case, does not cover
API-created contacts; it does not replace ClipStitchr's app-owned confirmation.

## Shared Unlock Experience

When a functional tool seam is selected for the approved hybrid variant, the
shared experience for open-result, useful-preview, and gated-portability tools
follows one consistent sequence:

1. A visitor reaches a public tool page and can read the explanation, examples,
   guide, FAQ, and related resources.
2. The visitor uses the tool without a signup interruption.
3. The tool presents the complete open result, useful preview, or complete
   on-page resource assigned above.
4. An inline panel describes the exact additional value available.
5. The form requires one name field and one email field.
6. Clear consent copy states that submitting unlocks the promised value and
   requests entry to the ClipStitchr app-marketing mailing list, that a new
   address must be confirmed before marketing begins, and that no product
   account is created.
7. An accepted submission immediately sets the non-identifying local marker,
   rotates the HttpOnly recognition cookie, and unlocks the promised
   browser-local value.
8. Once provider delivery is enabled, a new or opted-out address receives a
   separate confirmation email before any marketing Workflow begins; the
   browser unlock never waits for that click.
9. A relevant paid ClipStitchr CTA appears after the visitor receives that
   value.

Email-native experiences are the deliberate exception. Their public pages
explain the curriculum and show locked titles, but no lesson body is sent to
the browser before explicit confirmation. When provider readiness is
incomplete, the lessons stay locked and the page does not promise an inbox
sequence. A browser-recognition cookie never unlocks a course. The explicit
course confirmation creates a separate app-owned HttpOnly course session; that
verified session can request another course without re-entering name and
email, while the regular form remains available on a new device or for updated
details.

Buttons use the promised outcome, such as “Unlock my complete plan,” “Unlock all
8 hooks,” or “Unlock the download.” Generic “Submit” copy is not used.

While provider readiness is disabled, user-facing copy must not say “Email my
results,” “Send me the file,” “Start the daily email course,” or otherwise imply
that a personalized artifact will arrive in the inbox.

## Required Fields and Browser Unlock

Both name and email are required. No company, role, team size, phone number, or
campaign questionnaire is added to the shared form. Lead qualification comes
from tool behavior rather than a longer form.

One accepted signup unlocks all browser-local companion, preview, and
portability value on that browser. It does not silently enroll the contact in
the three email-native sequences; each sequence still requires an explicit
enrollment action.

This portfolio unlock is directional. A regular tool signup never creates a
course entitlement. A signup for one course also unlocks regular browser-local
tool value, but confirmation activates only that course. It does not unlock the
other course or workshop. The sprint and mini-course release one section every
24 hours from activation; the workshop opens in full. Course progress is saved
per item in Convex for cross-device continuation and is not part of the Loops
contact projection.

Page-readable browser storage contains only a non-identifying local unlock
marker, never the submitted name, email, or recognition token. The server sets
the opaque random recognition token as an HttpOnly, `SameSite=Strict` cookie,
which keeps its plaintext in the browser while preventing page scripts from
reading it. The server stores only a hash of that token and its contact
association for later approved interactions. The token is not a readable
contact identifier and is never emitted to product analytics, URLs, or general
application logs.

The server-linked recognition token expires 180 days after issuance and is
rotated when that browser completes another accepted capture. Expiration,
unsubscribe, or deletion does not remove already-earned browser-local value:
the local unlock marker remains until the visitor clears site data. Unsubscribe
immediately disables new contact-linked qualification interactions. A privacy
deletion removes the token hash and contact link immediately. Clearing site
data or changing browsers may require another submission. Existing subscribers
receive the same successful response and a new valid token without revealing
whether the address was already stored.

This unlock is deliberately lightweight. The resources are acquisition assets,
not paid entitlements, and the token is not a digital-rights-management
boundary.

## Contact Data and Attribution

The legacy `waitlist` row cannot represent the approved measurement model. It
stores one source and leaves an existing row unchanged, so later use of other
tools is lost. The canonical model therefore distinguishes three logical
records:

- A canonical marketing contact keyed by normalized email, with required name,
  consent timestamp and copy version, verification status, subscription status,
  first source, latest source, and created and updated timestamps.
- A tool lead capture for each accepted name-and-email submission, with the
  contact reference, tool key, gate mode, experiment variant, attribution
  values, and timestamp.
- A bounded tool interaction for later token-recognized result, unlock, and paid
  CTA events, with the contact reference, tool key, event type, and timestamp.
  These interactions update latest-source and qualification signals without
  collecting the tool's inputs or result.

Legacy records remain preserved, and migration must not manufacture consent.
Every public capture continues to avoid leaking created-versus-existing status
to the browser.

The email model additionally requires durable provider operations, logical
Workflow enrollments keyed by contact plus Workflow version, provider-deletion
tombstones, and webhook deduplication records. Legacy rows without reviewable
consent evidence are migrated as consent unknown and marketing ineligible; they
cannot enter a Loops Workflow until they complete the new confirmation path.

Tool answers, calculator values, generated copy, filenames, campaign details,
and uploaded media are not attached to the marketing contact. Local media stays
in the browser. Analytics never includes name, email, unlock token, or result
content.

## Approved Loops Email Boundary

Loops is locked in as the provider for marketing Workflows and bounded future
transactional email. ClipStitchr integrates through a focused Convex adapter
that uses the official `loops` JavaScript SDK. The community
`@devwithbobby/loops` Convex component will not be mounted as the foundational
integration.

The provider choice does not make Loops the product source of truth. Convex
retains the canonical marketing contact, consent evidence, first and latest
tool attribution, captures, interactions, unlock hashes, and durable provider
operation state. Loops retains the delivery projection used for Workflows,
campaigns, templates, unsubscribe handling, suppression, and message delivery.

The provider adapter and durable operation path remain guarded by explicit
readiness settings. When enabled, an accepted capture commits its canonical
records and durable provider work before returning the browser unlock. The
browser does not wait for Loops, so a provider outage cannot hide
already-earned local value. No live Loops operation was enabled or sent while
implementing the original path. It has since been validated in the isolated
development environment and deployed to production with dispatch and rollout
still disabled.

Signed Loops webhooks reconcile audience unsubscribe, list membership,
deletion, hard bounce, and complaint or suppression state into Convex. Normal
contact sync omits Loops' `subscribed` property so a retry or later tool visit
cannot silently resubscribe a person who opted out. Explicit re-consent is a
separate operation with a new consent timestamp and copy version.

A browser unlock does not prove that an address is deliverable. Once email
dispatch is enabled, a new address
receives a bounded transactional confirmation with no promotional copy and is
not added to a marketing Workflow until its forty-eight-hour, single-use token
is confirmed. Opening the link renders a no-side-effect, analytics-free page;
only an explicit same-origin confirmation button records consent. A resend
rotates the token, cancels older pending sends, and prevents stale operations
from emailing invalid links. This is app-owned because Loops' built-in double
opt-in currently does not gate API-created contacts. Existing verified
subscribers are not asked to confirm again. The Loops dashboard's disabled
double-opt-in setting does not change this app-owned requirement, because
API-created contacts are outside that dashboard flow. An opted-out contact must
complete the same explicit re-consent path before marketing can resume.

Public-tool nurture, welcome messages, courses, sprints, workshops, and paid
product invitations are marketing email and use Loops Workflows. They do not
use the transactional endpoint. Transactional email remains reserved for
action-specific, non-promotional account or paid-workflow messages. Tool
inputs, generated results, media, filenames, calculator values, IP addresses,
and raw unlock tokens are never sent to Loops.

## Segmented Mailing Paths

| Segment | Tool families | Useful email focus | Paid-product bridge |
| --- | --- | --- | --- |
| Hooks and messaging | Hook collections, generators, graders, rewrites, research, and teardowns | Better openings, testing angles, and examples | Turn strong hooks into finished ad variations |
| Content planning | Calendars, briefs, shot lists, test plans, and campaign planners | Planning systems and production guidance | Move from a plan to completed content |
| Production readiness | Video checkers, safe zones, compression, naming, and asset intake | Fixes and publishing preparation | Turn ready clips into stitched ads |
| Economics and scaling | Cost, budget, rate, capacity, and savings tools | Creative economics and sustainable scaling | Produce more variations without proportionally increasing cost |
| Learning and systems | Sprint, course, workshop, and system kit | Structured education and implementation | Put the system into practice with paid ClipStitchr |

Once the approved integration ships, a Loops Workflow may send an enrollment
confirmation, related guidance, or a static companion link, followed by a
practical workflow example, an explanation of the next production bottleneck,
and a direct paid-account invitation. Browser-personalized results remain local
and are not reconstructed or emailed unless a separate data and privacy
contract is approved. Nurture copy must not use free-account or free-trial
wording.

## Qualification Model

- **Captured:** submitted valid required fields with clear mailing-list consent.
- **Engaged:** returned, used another tool, or unlocked an export.
- **High intent:** used a campaign planner, audit, brief builder, testing
  blueprint, raw-clips planner, or savings report.
- **Product interested:** clicked a ClipStitchr feature, pricing, or paid-account
  CTA.
- **Converted:** created a paid account.

The team does not call a gate successful merely because it increases raw email
submissions. Engaged, high-intent, product-interested, and converted behavior
determines lead quality.

## Analytics Contract

The typed public-tool analytics boundary allowlists these privacy-safe events:

- Deliberate tool start, reserved for an actual interactive start action.
- Useful result displayed.
- Gate displayed.
- Lead accepted.
- Resource unlocked.
- Paid CTA clicked.

Every event has exactly four app-provided properties: `event_type`, the fixed
catalog `tool_key`, the approved `gate_mode`, and `experiment_variant`
(`control` or `hybrid-v1`). The shared capture emits `tool_lead_accepted` only
after the server returns its exact opaque accepted response. Other event names
are used only at explicit tool seams as rollout integration reaches them. The
shared gate boundary emits result-displayed, gate-displayed, and
resource-unlocked transitions once; passive component mount and nested capture
rendering do not emit `tool_started` or duplicate lifecycle events. No event
includes name, email, local marker, recognition token, confirmation token, tool
inputs, generated output, media facts, or file metadata. The standalone email
confirmation route mounts no PostHog, TikTok, or other analytics script.

Primary SEO and trust measures are organic impressions and clicks, tool-start
rate, result-view rate, repeat visits, multiple-tool use, and earned links or
shares. Mailing-list measures are result-to-capture conversion, deliverable
subscriber rate, later tool use, resource clicks, product clicks,
unsubscriptions, and complaints. Revenue measures are pricing visits, paid
accounts by first and latest tool, and time from first tool use to payment.

## Experiment and Rollout Plan

1. Instrument the current experience and establish at least two full weeks of
   baseline behavior, extending the baseline when traffic is too small.
2. Improve the sixteen open-result tools with specific optional companion
   offers while preserving the complete result.
3. Pilot export gates on a representative subset of resource formats.
4. Pilot useful-preview gates on high-intent generators, graders, planners, and
   audits.
5. Expand only patterns that improve qualified subscriber behavior without
   materially harming tool completion or repeat use.
6. Launch the three email-native gates only after the delivery contract is
   complete.

Initial experiments use control versus one variation, stable opaque visitor
assignment, one canonical URL, and identical public SEO content. The
`PUBLIC_TOOL_GATE_ROLLOUT` environment value must be one strict JSON object,
for example
`{"variant":"hybrid-v1","tools":["app-hook-generator"],"allocationPercent":50}`.
Missing, malformed, unknown-tool, duplicate-tool, or out-of-range configuration
fails closed to control. Email-native selection additionally requires provider
readiness derived on the server. Gate behavior does not change according to
whether a visitor came from Google or another source. No production allocation
was enabled in this implementation.

Pause a test when result completion declines by more than ten percent relative
to its control. Reject a gate that increases raw submissions without improving
engaged or high-intent leads. Search performance is evaluated over a longer
window than form conversion.

## Abuse Protection and Failure Behavior

The current capture endpoint already validates, normalizes, bounds, and rate
limits submissions. Any implementation change must preserve its same-origin,
body-size, per-client, per-email, and global protection.

Token issuance, token-recognized interactions, confirmation sends,
confirmation-token redemption, email-native enrollment, course workspace
reads, and course progress writes are new
user-triggered backend operations. They require server-side validation,
per-token or per-contact limits, per-client limits, and an appropriate global
limit before a contact record, analytics record, or provider call is created.
Both unlock-token and confirmation-token lookup must use a stored hash rather
than logging or persisting the raw token.

Before email delivery is added, the existing Convex rate limiter must consume
the relevant ingress per-contact, per-user or client, per-operation, and global
quotas before a Loops operation is created. Every initial provider attempt and
retry separately reserves shared Loops pacing immediately before the SDK call.
Shared pacing must remain below Loops' documented provider ceiling and handle
provider `429` responses with a bounded retry policy. The implementation must
return clear retry timing for user-facing HTTP `429` responses, preserve
authorization and consent separately from quota, and update
`docs/operations/security/rate-limits.md` with every enforcement point and limit.

An error never removes a result that was already public. A failed gated
submission shows a clear retry path and does not falsely claim that the visitor
joined the list or that a resource was delivered.

## SEO Boundaries

- Each tool retains one stable canonical route.
- Public explanations, examples, instructions, FAQs, and related links do not
  depend on form submission or client interaction.
- No full-screen signup interstitial hides the page.
- Search crawlers and human visitors receive the same public content and gate
  rules.
- Experimental variants do not create duplicate indexable URLs.
- Registration-only content is not presented to crawlers as though it were
  public to users.

These boundaries follow Google's guidance on publicly accessible content,
intrusive interstitials, and search-safe website testing.

## Implementation Areas

Current files that own the shipped lead path:

```text
web/
  app/_components/tools/ToolLeadCaptureForm.tsx
  app/_components/tools/gates/
  app/email/confirm/route.ts
  app/api/tools/[tool]/email-native-enrollment/route.ts
  app/api/tools/[tool]/lead/route.ts
  convex/toolLeads/submit.ts
  lib/clipstitchr/email/confirmation/
  lib/clipstitchr/tools/browserRecognition/
  lib/clipstitchr/tools/catalog/publicToolGateCatalog.ts
  lib/clipstitchr/tools/catalog/rollout/
  lib/clipstitchr/tools/publicToolGates/
  lib/clipstitchr/tools/toolLeads/
```

These focused folders keep gate metadata, rollout resolution, browser unlock,
recognition, confirmation, capture attribution, and analytics responsibilities
separate. Routes with custom result or export behavior must still opt into a
functional seam before their approved gate can activate.

The email portion must also add the app-owned contact and durable provider
operation model, private official-SDK adapter, bounded retry state machine, and
signed webhook reconciliation described in
`docs/operations/email/integration.md`. No public request may select an
arbitrary Workflow event or transactional template ID.

## Verification Contract

- A catalog test proves that all fifty portfolio numbers appear in exactly one
  approved gate group.
- Form tests prove both name and email remain required.
- Gate tests prove the correct public and unlocked value for each mode.
- Unlock-state tests prove one successful capture unlocks browser-local value
  with an opaque token, stores no name or email locally, and does not silently
  enroll an email-native sequence.
- Confirmation tests prove the unlock does not wait for email verification,
  unverified contacts cannot enter marketing Workflows, verification tokens
  are hashed, expiring, single-use, and non-enumerating, scanner-like `GET`
  requests have no side effect, only a protected user `POST` confirms, rotated
  sends cannot deliver stale links, and opted-out contacts require explicit
  re-consent.
- Token tests prove only a server-side hash is stored, existing subscribers
  receive the same non-enumerating response, and later bounded interactions map
  to the correct eligible contact without exposing the token to analytics.
  Expiry and rotation tests use the 180-day contract; unsubscribe stops linked
  interactions, privacy deletion revokes the server token, and the local unlock
  marker preserves already-earned browser value.
- API and Convex tests preserve validation, size limits, rate limits, and
  privacy.
- Analytics tests prove fixed metadata and reject result content and PII.
- Page tests prove crawlable guide and FAQ content remains public.
- Email-native experiences require end-to-end delivery, unsubscribe, retry,
  bounce, rate-limit, and failure tests before their entry gates launch.
- Loops tests prove contact synchronization omits `subscribed`, provider work
  is asynchronous and idempotent, signed webhooks are deduplicated, opt-outs
  stop future marketing, and nurture cannot use transactional templates. They
  also prove one enrollment per contact and Workflow version, dispatch-time
  eligibility checks, provider-deletion tombstones, atomic operation leases,
  atomic webhook application, separate accepted and delivered states, and safe
  handling after Loops' twenty-four-hour idempotency window.
- Related implementation documents, the quality register, analytics docs,
  privacy copy, and `docs/operations/security/rate-limits.md` are updated in the same change.

## Source References

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google AI Search optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google guidance on intrusive interstitials](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials)
- [Google website-testing guidance](https://developers.google.com/search/docs/crawling-indexing/website-testing)
- [Google subscription and paywall markup](https://developers.google.com/search/docs/appearance/structured-data/paywalled-content)
- [Loops official JavaScript SDK](https://loops.so/docs/sdks/javascript)
- [Loops marketing-versus-transactional guidance](https://loops.so/docs/guides/transactional-vs-marketing-email)
- [Loops double opt-in scope](https://loops.so/docs/contacts/double-opt-in)
- [Loops webhooks](https://loops.so/docs/webhooks)
- `docs/content/lead-magnets/portfolio.md`
- `docs/operations/email/integration.md`
- `docs/features/public-tools/portfolio/public-app-marketing-tools.md`
- `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`
- `docs/features/public-tools/portfolio/public-tool-quality-register.md`
- `docs/operations/security/rate-limits.md`

## Decision Log

| Decision | Alternatives considered | Reason |
| --- | --- | --- |
| Optimize first for organic search and trust, then qualified email growth. | Gate every result to maximize immediate submissions. | Search visitors need a real win before the mailing-list exchange feels credible. |
| Use a 16 open / 13 preview / 18 portability / 3 email-native split. | Keep all fifty open or apply one gate to every tool. | Search intent and the divisibility of each result differ across the portfolio. |
| Require both name and email. | Require email only or add a longer qualification form. | A name supports human communication while tool behavior supplies stronger qualification than extra form questions. |
| Unlock regular browser-local gated value after one accepted signup while keeping course entitlements directional. | Require a form for every regular tool, silently enroll every sequence, or let the portfolio marker unlock courses. | Repeated regular-tool forms damage trust, while per-course confirmation prevents unwanted course access and messages. |
| Unlock browser-local value before promising email delivery. | Claim that a provider-disabled flow sends files, reports, or courses. | The browser value is immediate, while readiness checks keep inbox promises and live sends disabled until Loops is configured and verified. |
| Use an opaque unlock token and record accepted captures plus bounded later interactions separately from the canonical contact. | Store only the first waitlist source, use a boolean that cannot support attribution, or keep contact details in the browser. | Multi-tool behavior is necessary for qualification and first/latest-source attribution without placing name or email on the device. |
| Expire server-linked recognition after 180 days while preserving a local unlock marker. | Keep a permanent contact-linked browser token or revoke already-earned value on unsubscribe. | Finite recognition reduces the privacy lifetime; unsubscribe and deletion stop linked behavior without turning a free resource into DRM. |
| Keep tool inputs, results, and media out of contact records and analytics. | Store personalized results with the lead. | The approved unlock can operate locally without expanding the current privacy surface. |
| Use Loops through a ClipStitchr-owned Convex adapter over the official SDK. | Mount the community Loops component, call Loops directly from the browser, or build a complete email service. | The thin adapter preserves current API coverage, durable retries, consent reconciliation, attribution, idempotency, and the existing atomic quota model while Loops still owns delivery. |
| Unlock browser-local value immediately but verify new addresses before nurture. | Require an inbox click before showing the lead magnet or start marketing from every syntactically valid address. | Immediate value protects trust and completion, while confirmation keeps the actual mailing audience qualified. |
| Treat nurture and email-native education as marketing Workflows. | Send courses, workshops, or paid invitations through transactional templates. | Marketing messages must honor unsubscribe and must not use a delivery path that can bypass an opt-out. |
| Test gates gradually with a result-completion guardrail. | Roll out all gates at once. | Controlled rollout protects usefulness and makes lead-quality effects measurable. |
| Keep finished creative production paid. | Add a free ClipStitchr tier or free finished-ad export. | Public resources demonstrate expertise without replacing the product's core job. |
