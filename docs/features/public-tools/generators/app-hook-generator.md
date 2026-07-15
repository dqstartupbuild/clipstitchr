# App Hook Generator

## Overview

The public App Hook Generator at `/tools/app-hook-generator` gives app founders
and app marketers eight short-form ad openings from four plain-English details:

- App name
- Audience
- Problem the app helps with
- Desired outcome

The user can choose a Safe, Punchy, or Bold edge level. Each result contains the
finished hook, a human-readable angle, and a short explanation of why that
opening could work before an app demo.

The tool is a public acquisition surface. It does not create a free ClipStitchr
account or advertise a free product plan. The results experience links directly
to `/pricing` for people who want to turn an opening and product demo into a
finished ad workflow.

## How Generation Works

Generation is deterministic and template-backed. It does not call Replicate,
an AI model, the provider worker, or the media worker.

1. The API normalizes and validates every submitted field.
2. A stable hash of the normalized inputs selects from curated Safe, Punchy,
   and Bold subsets of the existing app-hook catalog.
3. The requested edge level controls the blend of curated template groups.
4. The bounded variation index changes the catalog offset so **Another set**
   returns a different, repeatable selection.
5. Dedicated fillers resolve supported placeholders with the submitted app,
   audience, problem, and outcome.
6. The server rejects an incomplete set, unresolved placeholder, or duplicate
   result instead of returning partial output.
7. Only `{ text, angle, reason }` leaves the server. Template IDs, source labels,
   internal style names, and catalog risk data are never included in the API
   response.

The curated catalog omits structures that depend on invented percentages,
prices, user counts, testimonials, time-limited offers, or unsupported product
claims. The public generator tests all three edge levels across multiple
variation indexes for eight distinct, resolved results.

## Request Contract

`POST /api/tools/app-hook-generator` accepts JSON with:

| Field | Requirement |
| --- | --- |
| `appName` | 2-80 characters |
| `audience` | 2-160 characters |
| `problem` | 2-240 characters |
| `desiredOutcome` | 2-180 characters |
| `edgeLevel` | `safe`, `punchy`, or `bold` |
| `variationIndex` | Optional integer from 0 through 100 |

The request body is capped at 8 KB using both the declared content length and a
bounded stream reader, so a chunked request is stopped as soon as it crosses
the cap. Braced template syntax in user fields is rejected so submitted text
cannot add or preserve internal placeholders.

Successful responses use `Cache-Control: private, no-store` and return exactly
eight public hook objects plus the variation index. Validation failures return
generic `400` or `413` messages. Unexpected failures return a generic `500`
message. Rate-limit failures return `429` with `Retry-After` without exposing
the internal quota name.

## Abuse Protection

The route creates a SHA-256 client key from `cf-connecting-ip`, then
`x-real-ip`, then the last valid value in `x-forwarded-for`. Browser user-agent data
is not part of the key, so changing it cannot create fresh client quota. The
raw address is not sent to Convex as the rate-limit key.

The dedicated `appHookGeneratorRateLimit.consume` mutation enforces both limits
before hook generation:

- 30 requests per hour per client key, with a burst of 10
- 3,000 requests per hour globally, with a burst of 300 across five shards

Although the generator has no provider cost, the limits protect the public API
and Convex rate-limit traffic from scripted abuse. See
`docs/operations/security/rate-limits.md` for the shared enforcement map and verification
steps.

### Mailing-List Capture

The mailing-list form does not call the public `waitlist.submit` mutation from
the browser. It sends only name and email as same-origin JSON to
`/api/tools/app-hook-generator/lead`; the route fixes the source as
`app-hook-generator` and rejects a client-supplied source or any other extra
field.

The shared handler caps the streamed body at 2 KB, creates a secret-keyed
IP-only client fingerprint, and calls the secret-gated `toolLeads.submit`
mutation. Convex consumes dedicated client, normalized-email, and global limits
before looking for the email. Existing rows are never patched. Both new and
existing emails receive the same `{ accepted: true }` response, and the form
does not fire a TikTok Lead conversion.

## Privacy and Analytics

The implementation does not write submitted fields or generated hooks to
Convex, R2, or another application data store. The route does not log them or
send them through ClipStitchr analytics helpers.

Generator lifecycle events record the selected edge level, whether the visitor
asked for an initial or another set, the result count, and a simple failure
category. The pricing CTA also uses fixed metadata. No event includes app name,
audience, problem, desired outcome, or generated text.

## User Experience

- The initial page explains the eight-result format and claim-safety guardrail.
- Editing any field cancels an active request, clears the older result, and
  resets the variation to the first set so hooks cannot appear to match new
  unsent input.
- The submit button communicates its loading state and disables repeat clicks.
- Every result can be copied individually.
- **Another set** advances the variation index while preserving the current
  input and edge level.
- A mailing-list form records App Hook Generator attribution through its fixed
  same-origin server route without revealing whether an email was already saved.
- Visible questions also power matching `FAQPage` structured data, while the
  tool itself publishes free `WebApplication` structured data.
- The results panel offers a paid ClipStitchr pricing CTA without a free-account
  or free-trial promise.
- Supporting guidance explains how to match a hook to the first product-demo
  shot and test one creative variable at a time.
- Contextual links point to the Ad Variant Calculator and the `/tools` hub.

## File Tree

```text
web/
  app/(content)/tools/app-hook-generator/page.tsx
  app/api/tools/app-hook-generator/
    route.ts
    route.test.ts
    lead/route.ts
    lead/route.test.ts
  app/_components/tools/app-hook-generator/
    AppHookGeneratorClient.tsx
    AppHookGeneratorEdgeField.tsx
    AppHookGeneratorEmptyState.tsx
    AppHookGeneratorFaq.tsx
    AppHookGeneratorForm.tsx
    AppHookGeneratorGuide.tsx
    AppHookGeneratorHero.tsx
    AppHookGeneratorPage.tsx
    AppHookGeneratorPage.test.tsx
    AppHookGeneratorPricingCta.tsx
    AppHookGeneratorResultCard.tsx
    AppHookGeneratorResults.tsx
    AppHookGeneratorTextArea.tsx
    AppHookGeneratorTextInput.tsx
  app/_components/tools/ToolLeadCaptureForm.tsx
  app/_components/tools/ToolLeadCaptureForm.test.tsx
  app/_components/tools/ToolDiscoveryLinks.tsx
  app/_components/tools/ToolStructuredData.tsx
  convex/
    appHookGeneratorRateLimit.ts
    appHookGeneratorRateLimit.test.ts
    rateLimiter.ts
    toolLeads/submit.ts
    toolLeads/submit.test.ts
    validators/toolLeadSource.ts
    validators/waitlistSource.ts
  lib/clipstitchr/tools/appHookGenerator/
    AppHookGeneratorEdgeLevel.ts
    AppHookGeneratorHook.ts
    AppHookGeneratorInput.ts
    AppHookGeneratorRequest.ts
    AppHookGeneratorResult.ts
    appHookGeneratorDescription.ts
    appHookGeneratorEdgeLevelOptions.ts
    appHookGeneratorFaqs.ts
    appHookGeneratorFieldLimits.ts
    defaultAppHookGeneratorInput.ts
    generateAppHooks.ts
    generateAppHooks.test.ts
    useAppHookGenerator.ts
    useAppHookGenerator.test.ts
    server/
      AppHookGeneratorInputError.ts
      AppHookGeneratorBodyTooLargeError.ts
      AppHookGeneratorTemplate.ts
      createAppHookGeneratorClientKey.ts
      createAppHookGeneratorClientKey.test.ts
      createAppHookGeneratorHooks.ts
      createAppHookGeneratorHooks.test.ts
      createAppHookGeneratorRateLimitResponse.ts
      createAppHookGeneratorRequestGuardResponse.ts
      appHookGeneratorMaxBodyBytes.ts
      curatedAppHookTemplateIds.ts
      fillAppHookGeneratorTemplate.ts
      fillAppHookGeneratorTemplate.test.ts
      getAppHookGeneratorAngle.ts
      getAppHookGeneratorOutcomeFill.ts
      getAppHookGeneratorReason.ts
      getAppHookGeneratorSeed.ts
      getAppHookGeneratorTemplateFillers.ts
      getAppHookGeneratorTraitFill.ts
      getAppHookGeneratorTraitFill.test.ts
      readAppHookGeneratorRequest.ts
      readAppHookGeneratorRequest.test.ts
      readAppHookGeneratorJsonBody.ts
      readAppHookGeneratorText.ts
      selectAppHookGeneratorTemplateIds.ts
      selectAppHookGeneratorTemplates.ts
  lib/clipstitchr/tools/toolLeads/
    ToolLeadAcceptedResponse.ts
    ToolLeadInput.ts
    getToolLeadInputIsValid.ts
    normalizeToolLeadEmail.ts
    normalizeToolLeadName.ts
    submitToolLead.ts
    submitToolLead.test.ts
    toolLeadEmailPattern.ts
    toolLeadFieldLimits.ts
    useToolLeadCapture.ts
    useToolLeadCapture.test.ts
    server/
      ToolLeadRequestError.ts
      createToolLeadClientKey.ts
      createToolLeadClientKey.test.ts
      createToolLeadRateLimitResponse.ts
      getToolLeadRequestIsSameOrigin.ts
      handleToolLeadRequest.ts
      handleToolLeadRequest.test.ts
      readToolLeadBodyText.ts
      readToolLeadBodyText.test.ts
      readToolLeadRequest.ts
      readToolLeadRequest.test.ts
      toolLeadMaxBodyBytes.ts
  lib/clipstitchr/tools/createToolFaqJsonLd.ts
  lib/clipstitchr/tools/createToolWebApplicationJsonLd.ts
  lib/clipstitchr/tools/server/getPublicToolClientIp.ts
  lib/clipstitchr/types/ToolFaq.ts
  lib/clipstitchr/types/ToolLeadSource.ts
```

Focused tests live beside the route, Convex mutation, client wrapper, request
reader, fingerprinting helper, deterministic generator, and page components.

## Existing Source References

The tool reuses these existing ClipStitchr resources without copying the full
catalog into a browser bundle:

- `web/lib/clipstitchr/resources/clipr/rawAppHookTemplates.ts` supplies the
  original app-hook structures on the server.
- `web/lib/clipstitchr/resources/clipr/cliprHookStyles.ts` supplies the existing
  style trigger metadata used to derive public angles and explanations.
- `web/app/_components/ui/Button.tsx`, `Panel.tsx`, and `PanelHeader.tsx` supply
  the existing interface primitives.
- `web/app/_components/analytics/TrackedButtonLink.tsx` tracks the fixed pricing
  CTA metadata without carrying generator content.
- `web/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse.ts`
  identifies shared Convex rate-limit errors; the tool wraps that result in a
  generic public response.

## Verification

From `web/`:

```bash
npx vitest run \
  convex/appHookGeneratorRateLimit.test.ts \
  lib/clipstitchr/tools/appHookGenerator/generateAppHooks.test.ts \
  lib/clipstitchr/tools/appHookGenerator/useAppHookGenerator.test.ts \
  lib/clipstitchr/tools/appHookGenerator/server/readAppHookGeneratorRequest.test.ts \
  lib/clipstitchr/tools/appHookGenerator/server/fillAppHookGeneratorTemplate.test.ts \
  lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorTraitFill.test.ts \
  lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorHooks.test.ts \
  lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorClientKey.test.ts \
  app/api/tools/app-hook-generator/route.test.ts \
  app/_components/tools/app-hook-generator/AppHookGeneratorPage.test.tsx

npm run typecheck
```

Before production release, deploy the Convex function and limiter configuration,
then temporarily reduce the client bucket and confirm the second request returns
`429` with a valid `Retry-After` header before hook assembly runs. No Cloud Run
worker redeploy is needed for this feature.

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
