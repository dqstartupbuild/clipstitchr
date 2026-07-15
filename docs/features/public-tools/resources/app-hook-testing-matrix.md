# App Hook Testing Matrix

## What it does

The public `/tools/app-hook-testing-matrix` route turns up to five hooks, three
visuals, one stable CTA, one audience, and one offer into a controlled test
matrix. The result contains a control, hook-only challengers, and visual-only
follow-ups. Every cell explicitly names the changed variable.

## How it works

`buildAppHookTestingMatrix` removes blank and duplicate values, applies the
five-hook and three-visual caps, keeps the first hook and visual as the control,
and does not create a full cross-product. Visual follow-ups tell the visitor to
lock the selected Stage 1 hook before changing the visual. The complete matrix
stays visible on the page. The staged control keeps its Markdown download. In
the approved `hybrid-v1` experience, accepted name-and-email capture unlocks a
CSV matrix in that browser. The CSV includes every cell plus the stable
audience and offer, and is generated locally without persisting the plan.

## Use cases and boundary

- Organize a small hook test without changing multiple creative variables.
- Keep the audience, offer, and CTA visible in every test handoff.
- Plan the next visual comparison only after selecting a hook.
- Does not create assets, run tests, spend money, track results, predict
  performance, or persist a campaign.

## Relevant files

- `web/lib/clipstitchr/tools/appHookTestingMatrix/`
- `web/app/_components/tools/app-hook-testing-matrix/`
- `web/app/(content)/tools/app-hook-testing-matrix/page.tsx`

`createAppHookTestingMatrixCsv.ts` owns the CSV serialization, and
`AppHookTestingMatrixPortabilityAction.tsx` owns the control-versus-hybrid
download presentation.

## Source references

- Capability contract: `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`
- Catalog identity: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Ongoing evidence: `docs/features/public-tools/portfolio/public-tool-quality-register.md`

## Verification

Pure tests verify the control, hook-only cells, visual-only cells, stable CTA,
input caps, and CSV row coverage. Page and gate tests prove the full matrix
remains public, the CSV stays hidden until browser unlock, the control Markdown
action remains unchanged, and the lead source, paid CTA, and canonical metadata
render.
