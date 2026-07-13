# Client Content Capacity Calculator

## Purpose

This public calculator helps agencies and creator teams model weekly content
capacity across capture, editing, and review. It exposes the limiting stage,
deliverable ceiling, client capacity, and current utilization.

## Formulas

- Effective stage hours equal available hours multiplied by the visitor's
  productive-time percentage.
- Stage capacity divides effective hours by hours per deliverable.
- Weekly output is the floor of the lowest stage capacity.
- Client capacity divides weekly output by entered deliverables per client.
- Utilization compares current-client commitments with weekly output.

If any stage has no effort estimate, the tool reports capacity as unavailable.

## Files

- Logic, types, defaults, limits, FAQs, and tests:
  `web/lib/clipstitchr/tools/clientContentCapacity/`.
- Atomic UI and page tests:
  `web/app/_components/tools/client-content-capacity-calculator/`.
- Route: `web/app/(content)/tools/client-content-capacity-calculator/page.tsx`.

## Free and paid boundary

The result is a planning model, not a staffing guarantee. It does not assign
work, book clients, manage projects, hire people, store assets, or produce
finished content. Paid ClipStitchr workflows remain separate.

## Sources

- `docs/content/lead-magnet-portfolio.md`, portfolio item 39.
- `docs/features/public-tool-batch-16-50-design.md`.
- `docs/features/public-tool-quality-register.md`.
