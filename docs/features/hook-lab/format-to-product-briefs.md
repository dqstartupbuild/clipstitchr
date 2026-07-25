# Hook Lab Direct Product Adaptations

Completed Hook Lab reports can become an editable, original scene-by-scene ad
for the product that is active in the dashboard product picker. **Use this
format** transfers how the reference communicates without treating its product
mechanic as a feature of the selected product. It does not search the Hook
Library, ask for another product, or send the user to Clipr, Stitchr, or Swipr.

## What it does

- Uses the complete saved analysis, source caption, ordered transcript,
  on-screen text, detailed timeline, and versioned format analysis.
- Locks a reference-preservation contract before writing: runtime, beat count,
  hook archetype, first-frame emotion, setting, shot order, edit rhythm,
  signature visual, open loop, proof timing, payoff timing, and CTA style.
- Preserves compatible actions, props, framing, jokes, demonstrations, visual
  progress devices, and emotional turns so the result is recognizable as the
  same format.
- Uses minimum necessary adaptation. It changes source branding, unsupported
  product behavior, unsupported UI, causal claims, creator-specific wording,
  and the exact CTA without rebuilding unrelated parts of the ad.
- Treats `productDetails` as the authority for product capabilities. Audience,
  emotional narrative, inferred problem, and inferred pain points can guide the
  angle but cannot establish that a feature exists.
- Replaces only the unsupported cause or result inside a reference beat when
  the setting, action, prop, or visual device can remain truthful.
- Distinguishes editor-added overlays from product behavior. A visible rep
  count can remain as a filming or editing device when the action is visible,
  but it cannot be described as app tracking unless `productDetails` supports
  tracking.
- Allows generic source wording when it fits while excluding creator identity,
  likeness, source footage, personal mannerisms, and distinctive catchphrases.
- Requires the writing model to audit every spoken line, on-screen line,
  demonstration, payoff, and CTA against the saved product details before
  returning the script. Unsupported features, UI behavior, automations,
  results, numbers, comparisons, and testimonials must be removed or rewritten.
- The user can review and edit the completed adaptation directly in Hook Lab.
- Shows the finished adaptation inside the analysis dialog for review, editing,
  copying, saving, and regeneration.
- Reloads the newest saved adaptation for the source post whenever its report
  dialog is reopened. Reopening and reading a saved script does not generate a
  replacement or charge another credit.
- Charges one creation credit for every generation or regeneration. Editing,
  saving edits, and copying an existing adaptation cost no credits.

The Hook Library remains available as its own top-level Hook Lab tab for users
who want to browse standalone hook patterns. It is not part of the direct
format-to-product action.

## User flow

1. Select a product with the existing dashboard product picker.
2. Open a completed Hook Lab report.
3. Use **Quick read** for the short summary and format recipe. Open **Full
   breakdown** only when the frame-by-frame evidence is needed.
4. Choose **Use this format** from Quick read or the empty **Your script** view.
5. Hook Lab reserves one creation credit, labels reference elements as keep,
   adapt, or remove, and changes only what conflicts with the active product.
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
and the selected `ProductProfile`. Generation follows this authority order:

1. `productDetails` supplies the only product capability and claim truth.
2. Product audience and inferred context can guide positioning but cannot prove
   a feature.
3. Format DNA supplies a preservation contract for structure, execution,
   pacing, and narrative roles.
4. The full forensic report supplies timing evidence but not transferable
   product behavior.

The model first labels reference elements as keep, adapt, or remove. Compatible
settings, actions, props, framing, progress devices, and payoffs stay in place.
If a literal source mechanic is unsupported, the model replaces only the
unsupported product claim or causal behavior and uses the closest behavior
supported by `productDetails`. The model returns JSON with:

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
limits. Hook Lab direct adaptations use prompt-level semantic grounding and a
final in-model claim audit. They do not add a second provider request or a
deterministic generated-claim rejection pass.

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
  createHookLabFormatPreservationContract.ts
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
- Analyze a reference whose app exchanges push-ups for screen time. Generate for
  Guppy and confirm the script preserves the original setting, phone reveal,
  push-up action, shot order, counted completion loop, pacing, and payoff while
  replacing only the unsupported screen-time or alarm-control claim.
- Confirm an editor-added rep count is described as an overlay rather than
  Guppy UI unless the saved product truth explicitly supports automatic rep
  tracking.
- Confirm the adaptation does not replace that source with an unrelated mirror
  or transformation premise.
- Confirm every generated product behavior can be traced to the selected
  product's `productDetails`, and that inferred pain points are used only for
  positioning.
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
- Confirm supported numbers, measurable results, testimonials, and product
  capabilities can still be saved without a deterministic generated-claim
  rejection.

## Source references

- `docs/features/hook-lab/hook-lab-post-analysis.md`
- `docs/architecture/creation-credit-system.md`
- `docs/operations/security/rate-limits.md`
- `project-scope.md`
