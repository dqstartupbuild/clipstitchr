# Hook Library Browser

The Hook Library is the second tab on `/dashboard/hooks`. It makes the existing
ClipStitchr hook catalog browsable without sending all 1,159 templates to the
browser at once.

## What it does

- Searches template wording, category names, emotional triggers, and best-use
  descriptions.
- Filters by one of 16 hook categories, emotional feeling, supported tool, and
  intensity.
- Returns 24 results per page with previous, next, nearby, first, and last page
  controls.
- Copies an individual template to the clipboard.
- Keeps the source catalog shared with Clipr, Stitchr, and Swipr so browsing and
  generation do not drift into duplicate template sets.
- Stays separate from completed-post adaptations. **Use this format** remakes
  the analyzed reference directly and does not search this catalog.

## Request flow

1. `HookLibraryWorkspace` owns the visible filters and page number.
2. `useDeferredValue` keeps typing responsive while the search request settles.
3. `useHookLibraryTemplates` requests the authenticated static-data endpoint.
4. `readHookLibraryQuery` bounds text, page, purpose, and risk inputs.
5. `listHookLibraryTemplates` filters the server-side catalog before slicing one
   24-item page.
6. The UI renders only that page and preserves real pagination semantics through
   `aria-current`, disabled edge controls, and an accessible navigation label.

## Abuse and privacy

`GET /api/hook-lab/templates` requires an authenticated user. It creates no
write, storage, provider, or third-party cost. Responses are derived from a
fixed in-process catalog, search text is capped at 80 characters, page numbers
are capped at 1,000, and every response contains at most 24 templates. For those
reasons the endpoint intentionally has no separate rate bucket. Authentication
and the bounded response remain independent safeguards.

The legacy related-template endpoint remains an authenticated, bounded,
read-only catalog lookup, but the current product-adaptation UI does not call it.

## File tree

```text
web/app/api/hook-lab/templates/
  route.ts
  getHookLibraryTemplatesRoute.ts
web/app/_components/hooks/
  HookLibraryFilters.tsx
  HookLibraryGrid.tsx
  HookLibraryPagination.tsx
  HookLibraryTemplateCard.tsx
  HookLibraryWorkspace.tsx
web/lib/clipstitchr/server/hookLibrary/
  listHookLibraryTemplates.ts
  readHookLibraryQuery.ts
web/lib/clipstitchr/resources/clipr/
  cliprHookTemplates.ts
```

## Verification

- Confirm the first response contains exactly 24 items while the unfiltered
  total remains above 1,000.
- Search for a known word and confirm every returned page respects it.
- Change category, feeling, tool, and intensity independently and together.
- Move through first, middle, and last pages with a pointer and keyboard.
- Copy a template and confirm the clipboard contains exactly the visible text.
- Confirm anonymous requests return an authentication error.

## Source references

- `web/lib/clipstitchr/resources/clipr/cliprHookTemplates.ts`
- `web/lib/clipstitchr/resources/clipr/cliprHookStyles.ts`
- `docs/features/hook-lab/hook-lab-post-analysis.md`
