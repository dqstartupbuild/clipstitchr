# Short-Form Ad Preflight Checklist

## Purpose

The Short-Form Ad Preflight Checklist at
`/tools/short-form-ad-preflight-checklist` gives app teams one final human
self-review before a short-form ad leaves the team.

## How It Works

Twenty checks cover hook, opening visual, demo, pacing, evidence, claims,
testimonials, sensitive review, CTA, destination match, captions, audio,
vertical framing, interface obstruction, playback, boundary frames, footage
usage, third-party assets, private information, and the live destination.

Safety-sensitive checks use the `Must check` label. The percentage represents
completion, not approval. Any unchecked Must check item remains a blocker even
when most other checks are complete.

The staged control retains the existing Markdown action. In the approved
`hybrid-v1` experience, every check and note remains usable on the page while
accepted name-and-email capture unlocks the exact browser print action. The
print action does not upload notes, inspect the ad, or promise email delivery.

## Use Cases

- Review the final file with and without sound.
- Connect each factual claim to a current evidence source.
- Confirm captions, audio, framing, CTA, and destination message match.
- Hand usage, privacy, and third-party asset records to a responsible reviewer.

## Paid Boundary and Privacy

The checklist does not inspect media, verify permission, predict approval,
edit, export, or publish an ad. It cannot guarantee platform acceptance. Notes
stay browser-local and are not included in optional mailing-list capture.

## Relevant Files

- `web/lib/clipstitchr/tools/shortFormAdPreflight/shortFormAdPreflightDefinition.ts`
- `web/lib/clipstitchr/tools/shortFormAdPreflight/shortFormAdPreflightDefinition.test.ts`
- `web/app/(content)/tools/short-form-ad-preflight-checklist/page.tsx`
- `web/app/_components/tools/resources/ShortFormAdPreflightPage.test.tsx`
- `web/app/_components/tools/resources/GuidedResourcePortabilityActions.tsx`
- `web/app/_components/tools/resources/ResourcePrintButton.tsx`

The page uses the shared guided-resource components and no provider, media,
storage, or platform API.

## Verification

Definition tests prove exactly twenty unique checks, coverage of all promised
areas, at least ten explicit blockers, and no approval language. The page test
covers count, blockers, exact lead source, canonical metadata, and pricing.
Shared page tests prove the hybrid print action stays locked until browser
unlock without hiding any checklist content.

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
