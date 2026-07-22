# Hook Lab Direct Product Adaptations

Completed Hook Lab reports can become an editable, scene-by-scene remake for
the product that is active in the dashboard product picker. **Use this format**
does not search the Hook Library, ask for another product, or send the user to
Clipr, Stitchr, or Swipr.

## What it does

- Uses the complete saved analysis, source caption, ordered transcript,
  on-screen text, detailed timeline, and versioned format analysis.
- Preserves the visual opening, reaction direction, prop placement, object
  interaction order, scene order, spoken-copy structure, text structure,
  caption structure, timing, tension, joke, reveal, and payoff.
- Rewrites product facts, claims, demonstration, and CTA for the globally
  active saved product.
- Allows generic source wording when it fits while excluding creator identity,
  likeness, source footage, personal mannerisms, and distinctive catchphrases.
- Keeps unsupported-claim validation. A generated product claim must still be
  grounded in the selected saved product.
- Shows the finished adaptation inside the analysis dialog for review, editing,
  copying, saving, and regeneration.
- Charges one creation credit for every generation or regeneration. Editing,
  saving edits, and copying an existing adaptation cost no credits.

The Hook Library remains available as its own top-level Hook Lab tab for users
who want to browse standalone hook patterns. It is not part of the direct
reference-remake action.

## User flow

1. Select a product with the existing dashboard product picker.
2. Open a completed Hook Lab report.
3. Review the first frames, scene mechanics, likely meaning, full forensic
   play-by-play, and details that carry the effect.
4. Choose **Use this format**.
5. Hook Lab reserves one creation credit and generates from the complete report
   plus the active product.
6. The saved adaptation appears in the same dialog with these editable
   sections:
   - adapted concept;
   - opening reaction;
   - scene-by-scene shot directions;
   - spoken lines;
   - on-screen text by scene;
   - props and interactions;
   - product demonstration;
   - closing CTA;
   - adapted caption.
7. Save edits or copy the script without another charge.
8. If the global product changes, choose **Regenerate** to create and charge for
   a new adaptation for that product.

If the current product is missing or locked, Hook Lab disables generation and
asks the user to select an available product through the dashboard picker.

## Generation contract

The model receives the full `HookLabPostAnalysis`, the imported source caption,
and the selected `ProductProfile`. It returns JSON with:

```text
adaptedConcept
openingReaction
sceneBySceneDirections[]
spokenLines[]
onScreenTextByScene[]
propsAndInteractions[]
productDemonstration
closingCta
adaptedCaption
```

New records also populate the legacy creative-brief fields as compatibility
mirrors. This keeps older destination handoffs readable without exposing a
destination choice in the new workflow. New direct adaptations stay in Hook
Lab and are never automatically marked approved or used by another tool.

## Credit lifecycle and abuse protection

`POST /api/hook-lab/briefs` authenticates the user, consumes script-generation
rate limits, verifies source-post and product ownership, and then reserves one
`hook_lab_script` creation credit. The text-model call happens only after the
reservation succeeds.

The reservation is committed after the generated adaptation is validated and
durably inserted. Provider, validation, dispatch, or save failure releases the
reservation. Every explicit regeneration creates a new record and receives its
own reservation. `hookLabCreativeBriefs.update` is metadata-only and never
reserves a creation credit.

Current limits are:

- 180 script generations per owner per day with burst 24;
- 6,000 script generations globally per day with burst 900 across five shards;
- the shared text-provider spend guard;
- creation-credit availability as a separate spending boundary.

HTTP quota failures return `429` with retry timing. Product ownership, source
ownership, product lock state, generated-claim validation, and record ownership
remain separate from rate limits.

## File tree

```text
web/app/_components/hooks/
  HookLabProductAdaptationSection.tsx
  HookLabProductAdaptationEditor.tsx
  HookLabCreativeBriefField.tsx
  HookLabMeaningSection.tsx
  HookLabPostAnalysisDialog.tsx
web/app/api/hook-lab/briefs/
  route.ts
  createHookLabCreativeBriefRoute.ts
  readHookLabCreativeBriefRequest.ts
web/convex/hookLabCreativeBriefs/
  create.ts
  update.ts
  normalizeHookLabCreativeBriefContent.ts
web/lib/clipstitchr/server/hookLab/
  createHookLabCreativeBrief.ts
  createHookLabCreativeBriefPrompt.ts
  parseHookLabCreativeBrief.ts
  runHookLabScriptWithCredit.ts
web/lib/clipstitchr/hooks/
  useHookLabProductAdaptation.ts
web/lib/clipstitchr/utils/
  formatHookLabProductAdaptation.ts
  splitHookLabAdaptationLines.ts
```

## Verification

- Confirm **Use this format** sends only the globally active product ID and the
  selected source-post ID.
- Confirm no product, destination-tool, or related-hook selector appears.
- Switch from Guppy Calisthenics to Bloomin and confirm regeneration uses the
  Bloomin product ID.
- Confirm generated content renders all nine editable sections in the report
  dialog.
- Confirm save and copy do not call the generation route.
- Confirm credit reservation happens before model work, commit happens after
  durable save, and failure releases the reservation.
- Confirm all generated product claims remain supported by saved product data.

## Source references

- `docs/features/hook-lab/hook-lab-post-analysis.md`
- `docs/architecture/creation-credit-system.md`
- `docs/operations/security/rate-limits.md`
- `project-scope.md`
