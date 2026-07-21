# Hook Lab Format-to-Product Briefs

Completed Hook Lab reports can turn a reference post's structure into an
editable creative brief for one saved product. The workflow preserves the
opening mechanism, beat order, proof approach, product role, payoff, and edit
rhythm while requiring original words and product-grounded claims.

## What it does

- Adds versioned format DNA to every newly completed Hook Lab analysis.
- Separates directly observed evidence from inference.
- Explains the first frame, unresolved opening question, sound-off meaning,
  proof device, product role, signature device, and edit rhythm.
- Labels possible copyability risks as warnings rather than proven facts.
- Shows three bounded Hook Library matches based on opening intent and
  structural language.
- Lets the user choose an unlocked saved product and Clipr, Stitchr, or Swipr.
- Generates one editable creative brief using only saved product context for
  product facts, claims, audience details, pain points, and benefits.
- Rejects generated hooks, overlays, CTAs, or beats that stay too close to the
  source caption, spoken lines, on-screen text, or explicit do-not-copy list.
- Rejects measurable, absolute, authority, or regulated claim signals unless
  the same kind of claim is present in the saved product context.
- Saves the brief as its own owner-scoped record and carries its ID into the
  selected creation tool.

Older saved reports remain readable because `analysis.formatDna` is optional in
the schema. They do not expose the format-to-product action unless they contain
the versioned format DNA contract.

## User flow

1. Open a newly completed Hook Lab report.
2. Read the first-three-second breakdown and reusable format shape.
3. Review three related Hook Library patterns.
4. Choose **Use this format**.
5. Choose a saved product, destination tool, and Hook Library starting point.
6. Generate and edit the opening visual, hook, sound-off overlay, beat script,
   footage needs, product proof, and CTA.
7. Choose **Save and open** for the destination tool.
8. Clipr loads the brief into its script direction, Stitchr loads the sound-off
   overlay and shot-plan notice, and Swipr loads the brief into its creative
   direction.

The destination marks an approved brief as used after it loads. Product
selection is synchronized before the user generates or saves destination
content, preserving product ownership and lineage.

## Analysis contract

`formatDna.version` is currently `format-dna-v1`. Its fields are:

```text
openingVisual
openingQuestion
firstPayoff
firstPayoffAtSeconds
hookPattern
storyFramework
storyBeats[]
proofDevice
retentionDevice
signatureDevice
productRole
productFirstAppearsAtSeconds
adObviousness
ctaStyle
editRhythm
soundOffSummary
replicationFormula
doNotCopy[]
confidence
observedEvidence[]
inferences[]
```

The provider prompt version is `hook-lab-post-analysis-v3`, and the saved
analysis version is `post-analysis-v3`. The parser requires format DNA for new
provider results and continues to enforce full-runtime timeline coverage.

## Creative brief records

`hookLabCreativeBriefs` stores:

- ownership and identity: `ownerId`, `id`;
- lineage: `productId`, `sourcePostIds`, `hookTemplateId`,
  `formatDnaVersion`;
- destination: `destinationTool`;
- editable content: `directionName`, `openingVisual`, `hook`,
  `soundOffOverlay`, `beatScript`, `footageNeeds`, `productProof`, and
  `callToAction`;
- lifecycle: `draft`, `approved`, or `used`, plus timestamps.

Create, read, update, approval, and use mutations all resolve records through
the authenticated owner. Creation also confirms that the saved product belongs
to the owner and every source post is ready with format DNA.

## Related Hook Library matching

Related templates are ranked server-side against the format's hook pattern,
story framework, opening question, proof device, product role, and retention
device. Only three compact summaries are returned. The complete catalog never
moves into the browser, and destination generation filters to templates allowed
for the selected tool.

## Cost, limits, and credits

Creative-brief generation calls the configured text-writing model only after
authentication and these Convex limits:

- 60 briefs per owner per day with burst 8;
- 2,000 briefs globally per day with burst 300 across five shards;
- the shared text-provider spend guard.

HTTP quota failures return `429` with retry timing. Saving a generated brief
also consumes the shared Convex record-save limit; edits and approval consume
the shared metadata-update limit, as does the first destination handoff that
marks an approved brief as used.

Brief generation intentionally does not consume a creation credit. The brief is
planning metadata, not a rendered content asset. Normal Clipr, Stitchr, and
Swipr generation or save paths keep their own existing credit and cost rules.
Authentication, product ownership, post ownership, and brief ownership remain
separate from rate limits.

## File tree

```text
web/app/_components/hooks/
  HookLabFirstThreeSecondsSection.tsx
  HookLabFormatDnaSection.tsx
  HookLabCopyabilityWarningSection.tsx
  HookLabRelatedTemplatesSection.tsx
  HookLabCreativeBriefDialog.tsx
  HookLabBriefHandoffNotice.tsx
web/app/api/hook-lab/briefs/
  route.ts
  createHookLabCreativeBriefRoute.ts
  readHookLabCreativeBriefRequest.ts
web/app/api/hook-lab/templates/related/
  route.ts
  getRelatedHookLabTemplatesRoute.ts
web/convex/hookLabCreativeBriefs/
  create.ts
  get.ts
  update.ts
  approve.ts
  markUsed.ts
web/lib/clipstitchr/server/hookLab/
  createHookLabCreativeBrief.ts
  createHookLabCreativeBriefPrompt.ts
  parseHookLabCreativeBrief.ts
  getRelatedHookLibraryTemplates.ts
web/services/provider-worker/hookLab/
  createHookLabPostAnalysisPrompt.ts
  parseHookLabFormatDna.ts
```

## Verification

- Parse a report with observations, inferences, product timing, and the full
  format-DNA shape.
- Reject a new provider report without format DNA.
- Return exactly three related templates and keep the catalog server-side.
- Reject a brief request without a supported destination, saved product, or
  completed source report.
- Confirm the generated brief parser requires both beat and footage plans.
- Edit every brief field before approval and confirm the owner-scoped record is
  updated.
- Open each destination and confirm its brief direction is loaded only for the
  matching tool.
- Confirm unsupported claims and source wording are absent from a real generated
  sample before release.

## Source references

- `lazy-reel.md`
- `docs/features/hook-lab/hook-lab-post-analysis.md`
- `docs/features/hook-lab/hook-library-browser.md`
- `docs/operations/security/rate-limits.md`
