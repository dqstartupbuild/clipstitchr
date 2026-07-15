# Stitchr Templates Compatibility

Standalone Templates have been replaced in the product by Hook Lab Ideas. The
legacy Template model remains temporarily as a rollback and automation-
compatibility layer.

Stitch cards now use **Save as idea** and create a Stitch-sourced Idea. Stitchr
labels the dual-read recipe picker **Start from an idea**, and automation labels
allocations **Saved setup Ideas**. Legacy Template language remains only in
internal compatibility names and stored fields.

See `docs/features/hook-lab/hook-lab-ideas.md` for the current feature and
`docs/features/hook-lab/stitchr-hook-lab.md` for its implementation.

## Legacy Record

`stitchTemplates` preserves an editable Stitchr setup:

- source Hook/UGC and Demo IDs and names
- Normal or Longr mode
- clip trims and sequence segments
- source-audio flags and playback rates
- text-overlay style and copy
- caption and hashtag copy
- source Stitch ID and name

Template records do not own rendered videos, posters, music, or downloaded
blobs. The initial Hook Lab rollout does not delete or mutate them.

## Migration

The secret-gated
`migrations/migrateStitchTemplatesToHookLabIdeas:migrateStitchTemplatesToHookLabIdeas`
mutation creates one deterministic `migrated_template` Idea per owned Template.
It preserves the source Stitch and Template IDs plus the reusable assembly
recipe. Product-linked source Stitches create product-scoped Ideas; other
Templates become shared Ideas.

The migration is paginated at no more than 50 records per call, uses
`RATE_LIMIT_API_SECRET`, and is safe to rerun because each row has a stable
`migrationKey`. Verify the backfill with
`migrations/getHookLabMigrationStatus:getHookLabMigrationStatus` before
removing any compatibility code.

## Compatibility Behavior

Stitchr, Batch, and daily automation resolve a Hook Lab Idea recipe first and
fall back to a legacy Template through
`web/convex/getStitchRecipeByIdeaOrTemplate.ts`.

Existing `automationPreferences.stitchrTemplateAllocations` keep their Template
IDs in this rollout. They are not rewritten to Idea IDs, so the fallback reader
must remain until those preferences have been separately migrated or retired.

Legacy Template queries and mutations remain available for rollback and older
callers. Current Stitch-card and Hook Lab saves create Ideas instead of silently
creating a Template when a generated hook receives positive feedback.

## Navigation

Templates no longer appear as a Library tab.

- `/dashboard/templates` redirects to `/dashboard/hooks?view=ideas`.
- `/dashboard/library?tab=templates` also redirects to Hook Lab Ideas.

The old Template Library section can remain in source during the rollback
window, but it is not part of current navigation.

## Abuse Protection

Legacy writes retain their existing shared Convex limits:

- create: `convexRecordSave`
- rename: `convexMetadataUpdate`
- delete: `convexRecordDelete`

The migration is operator-secret protected and intentionally not user-rate-
limited. Operators must run bounded pages and inspect progress after each page.

## Retirement Gate

Do not remove `stitchTemplates`, old plan arrays, Template mutations, or
automation allocation fields until all of these are true:

1. Template and migrated-Idea counts match in production.
2. Every migrated Template Idea has a Stitch recipe.
3. Hook-option row counts match the legacy plan arrays.
4. Stitchr and automation Idea-first reads have completed a rollback window.
5. Legacy automation allocations have been migrated or explicitly retired.
6. A separate cleanup change updates schema, code, tests, and documentation
   together.
