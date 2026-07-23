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
- Does not reject generated wording based on product-claim, number, measurable-
  result, testimonial, or capability checks. The user can review and edit the
  completed adaptation directly in Hook Lab.
- Shows the finished adaptation inside the analysis dialog for review, editing,
  copying, saving, and regeneration.
- Reloads the newest saved adaptation for the source post whenever its report
  dialog is reopened. Reopening and reading a saved script does not generate a
  replacement or charge another credit.
- Charges one creation credit for every generation or regeneration. Editing,
  saving edits, and copying an existing adaptation cost no credits.

The Hook Library remains available as its own top-level Hook Lab tab for users
who want to browse standalone hook patterns. It is not part of the direct
reference-remake action.

## User flow

1. Select a product with the existing dashboard product picker.
2. Open a completed Hook Lab report.
3. Use **Quick read** for the short summary and remake recipe. Open **Full
   breakdown** only when the frame-by-frame evidence is needed.
4. Choose **Use this format** from Quick read or the empty **Your script** view.
5. Hook Lab reserves one creation credit and generates from the complete report
   plus the active product.
6. Hook Lab switches directly to **Your script** and shows a formatted reading
   view grouped into concept, production plan, and copy.
7. Choose **Edit script** only when changes are needed. Edit mode exposes these
   fields:
   - adapted concept;
   - opening reaction;
   - scene-by-scene shot directions;
   - spoken lines;
   - on-screen text by scene;
   - props and interactions;
   - product demonstration;
   - closing CTA;
   - adapted caption.
8. Close and reopen the report at any time to return to its newest saved script.
9. Save edits or copy the script without another charge.
10. If the global product changes, choose **Regenerate** to create and charge for
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

The reservation is committed after the generated adaptation is parsed and
durably inserted. Provider, parsing, dispatch, or save failure releases the
reservation. Every explicit regeneration creates a new record and receives its
own reservation. `hookLabCreativeBriefs.update` is metadata-only and never
reserves a creation credit.

Script generation is synchronous server work, so its credit reservation uses
direct-server provenance. It does not require or imitate a provider worker queue
entry. Legacy script reservations created with worker provenance but no queue
entry are released before the next direct analysis reservation is created.

Current limits are:

- 180 script generations per owner per day with burst 24;
- 6,000 script generations globally per day with burst 900 across five shards;
- the shared text-provider spend guard;
- creation-credit availability as a separate spending boundary.

HTTP quota failures return `429` with retry timing. Product ownership, source
ownership, product lock state, and record ownership remain separate from rate
limits. Hook Lab direct adaptations do not run generated-claim validation.

## File tree

```text
web/app/_components/hooks/
  HookLabAnalysisWorkspace.tsx
  HookLabQuickRead.tsx
  HookLabFullBreakdown.tsx
  HookLabBreakdownDisclosure.tsx
  HookLabScriptWorkspace.tsx
  HookLabProductAdaptationSection.tsx
  HookLabProductAdaptationPreview.tsx
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
  getLatestForSourcePost.ts
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
  dialog only after **Edit script** is selected.
- Confirm generation switches directly to **Your script**, which defaults to a
  formatted reading view.
- Confirm an existing script changes the Quick read action to **Open your
  script** and does not accidentally regenerate or charge another credit.
- Close and reopen the analysis dialog and confirm its newest saved script is
  loaded from Convex without another model request or credit charge.
- Confirm the tab list supports arrow-key navigation and remains usable on a
  narrow viewport.
- Confirm save and copy do not call the generation route.
- Confirm credit reservation happens before model work, commit happens after
  durable save, and failure releases the reservation.
- Confirm adaptations containing numbers, measurable results, testimonials, or
  product capabilities are saved without a generated-claim rejection.

## Source references

- `docs/features/hook-lab/hook-lab-post-analysis.md`
- `docs/architecture/creation-credit-system.md`
- `docs/operations/security/rate-limits.md`
- `project-scope.md`
