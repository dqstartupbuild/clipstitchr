# LLM Cache Evaluation

## Recommendation

ClipStitchr can benefit from `@mzedstudio/llm-cache`, but it should be adopted
selectively. The useful fit is deterministic or near-deterministic text and
metadata generation that already runs through Convex-gated backend workflows:

- product enrichment
- Clipr text, Swipr auto-text, and Stitchr auto-text
- upload metadata analysis when keyed by a stable file digest
- Swipr background metadata analysis when keyed by a stable file digest

It should not be used as a blanket cache for all AI features. Avatar photo
generation, Swipr background image generation, Swapr video generation, Clipr
and avatar video generation are user-facing creative outputs
where repeated prompts can reasonably be expected to produce new media. Caching
those outputs would also complicate credit accounting, R2 persistence, and
provider job audit trails.

The best path is a small pilot on product enrichment or Clipr/Swipr/Stitchr
text generation, then expand only after observing actual cache hit rates.

## Why It Fits This App

The app already uses Convex and Convex components. `web/convex/convex.config.ts`
registers the rate limiter and aggregate components, so adding another Convex
component follows the existing backend architecture.

The app also has several paid LLM-backed operations:

- Settings product create/update calls product enrichment before saving product
  metadata.
- `POST /api/clipr/text` generates reusable text for Clipr, Swipr, and Stitchr.
- Clipr job creation runs the same text-generation path as part of job
  planning.
- Upload and Swipr background analysis produce hidden searchable metadata.

These calls have repeated-input potential. A user may save the same product
details repeatedly, generate text for the same product/purpose/duration, upload
duplicate assets, or re-run metadata analysis after a failed browser-side save.
When that happens, a request/response cache can reduce provider spend and make
the second attempt faster.

## What The Component Provides

The package is a Convex component for caching LLM request/response pairs. Its
published README describes:

- deterministic SHA-256 cache keys from normalized request parameters
- request normalization for key order, whitespace, model-name casing, nullish
  fields, and float rounding
- default TTL, promotion TTL, and pinned entries
- response history for "time travel" debugging
- invalidation by cache key, model, model version, tag, or time range
- cache stats and browsing/filtering by model, tag, and date
- test registration support for `convex-test`

The package is currently `0.1.0`, Apache-2.0 licensed, and published as a
Convex component with a `convex` peer dependency. Its public GitHub repository
is small and early: 6 commits, 1 star, and no GitHub releases at evaluation
time. That does not disqualify it, but it argues for a limited pilot rather
than a broad dependency across all AI flows.

Sources checked:

- https://www.npmjs.com/package/@mzedstudio/llm-cache
- https://github.com/raymond-UI/llm-cache
- https://www.convex.dev/components/mzedstudio/llm-cache
- https://docs.convex.dev/components

## Best Initial Cache Targets

### Product Enrichment

Best first target.

Current behavior: product create/update sends product name, product details, and
audience details to the configured product enrichment model, then saves inferred
strategy fields in Convex.

Why caching helps:

- The input shape is small, text-only, and easy to normalize.
- The same product profile can be saved multiple times during setup.
- Output is hidden metadata, so exact-repeat reuse is less surprising than
  reusing visible creative media.
- It has clear invalidation boundaries: model ID, prompt version, and product
  input.

Suggested cache key payload:

```ts
{
  surface: "product-enrichment",
  promptVersion: "product-enrichment-v1",
  model: getProductEnrichmentModelId(),
  input: {
    name,
    productDetails,
    audienceDetails,
  },
}
```

### Clipr, Swipr, And Stitchr Text

Good second target.

Current behavior: `createCliprTextGeneration` is used for Clipr text generation
and powers Swipr/Stitchr auto-text through `POST /api/clipr/text`.

Why caching helps:

- The request is text-only.
- The same saved product, purpose, duration, slide count, and eligible hook
  candidates can repeat.
- Cached output can still be edited by the user after generation.

Main caution: the current implementation selects candidate hook templates before
the provider call. The cache key must include the chosen candidate IDs and
filled variables, not just the product ID, otherwise the cache can return text
for a different candidate set.

Suggested cache key payload:

```ts
{
  surface: "clipr-text",
  promptVersion: "clipr-text-v1",
  model: getCliprHookModelId(),
  purpose,
  durationSeconds,
  slideCount,
  productSnapshot,
  candidateTemplateIds,
  fillerSnapshot,
  temperature: 0.65,
}
```

### Upload And Background Analysis

Potentially useful, but only if the request includes a stable digest of the
actual media content.

Do not key these only by original filename, media kind, and prompt. Duplicate
filenames are common, and Media Bunny/browser workflows can create different
poster images under the same name.

Suggested cache key payload:

```ts
{
  surface: "upload-analysis",
  promptVersion: "upload-analysis-v1",
  model,
  mediaKind,
  originalName,
  fileSha256,
  analysisInputKind: "image" | "video" | "poster-fallback",
}
```

This requires computing a SHA-256 digest for uploaded analysis inputs before the
cache lookup.

## Poor Cache Targets

Do not cache these by default:

- Avatar photo generation
- Swipr background image generation
- Swapr video jobs
- Clipr avatar still/video generation
- Clipr, Stitchr, Longr, and shared-library music upload metadata

Reasons:

- Users often expect a new creative result from the same prompt.
- The response is usually a provider prediction or generated media URL, not a
  durable app-owned output.
- The app needs to record Replicate job IDs for auditability.
- R2 upload/copy behavior and credit accounting are tied to each generation.
- Cache hits could accidentally bypass the product's intended cost and usage
  model.

## Integration Shape

The component API is used from Convex function contexts, but ClipStitchr's
provider calls currently live mostly in Next.js route handlers. A practical
integration does not need to move all provider work into Convex immediately.

Recommended shape:

1. Register the component in `web/convex/convex.config.ts` as `llmCache`.
2. Add a small Convex wrapper module with atomic functions such as
   `lookupLlmCacheEntry`, `storeLlmCacheEntry`, `invalidateLlmCacheEntries`,
   and `getLlmCacheStats`.
3. Have selected Next.js routes call the Convex lookup wrapper after auth and
   input validation.
4. On a cache miss, consume the existing provider rate limit before calling the
   provider.
5. Store parsed, app-level response data, not raw provider prediction objects,
   unless the raw object is needed for debugging.
6. Include `promptVersion`, `model`, and a surface-specific input snapshot in
   every request object.

This keeps the cache behind Convex, preserves current route ownership, and
avoids a large backend migration.

## Rate Limit And Credit Rules

Caching must not weaken the repository's abuse-protection rules.

For a pilot, the safest behavior is:

- authenticate first
- validate ownership and input shape
- perform a cache lookup
- if the cache misses, consume the existing provider rate limit and then call
  the provider
- if the cache hits, return the cached app-level response without consuming the
  paid-provider bucket
- keep or add a cheap backend-read/write rate limit if cache lookup traffic
  becomes abusable
- update `docs/backend/rate-limits.md` before implementation ships

If the product's future paid credit ledger charges for "generation attempts"
rather than provider spend, then cache hits may still need to consume a product
credit. That policy should be decided before caching visible user-triggered
creative text.

## Data And Privacy Considerations

Cached requests and responses may contain:

- product descriptions
- audience descriptions
- hidden marketing strategy fields
- asset filenames
- generated text hooks and scripts
- avatar/background metadata descriptions

The cache should not store raw image/video blobs. For media analysis, store only
the digest and minimal request metadata in the key, plus parsed analysis output
as the response.

Because component tables are isolated from app tables, this is reasonably
contained, but the data still lives in the Convex deployment. Admin/debug views
must be protected, and any future cache explorer UI should not be exposed to
ordinary users.

## Prompt Versioning

Every cached surface needs an explicit prompt version. The model ID is not
enough because local prompt helpers can change without a provider model change.

Examples:

- `product-enrichment-v1`
- `clipr-text-v1`
- `upload-image-analysis-v1`
- `upload-video-analysis-v1`
- `swipr-background-analysis-v1`

When prompt wording, parsing expectations, output schema, or template
candidate-selection logic changes, bump the prompt version or invalidate the
affected cache tag.

## Suggested TTLs

Initial conservative TTLs:

| Surface | TTL | Reason |
| --- | --- | --- |
| Product enrichment | 7 days, promote to 30 days | Hidden metadata, stable inputs |
| Clipr/Swipr/Stitchr text | 24 hours, promote to 7 days | Creative text should refresh eventually |
| Upload image analysis | 30 days when keyed by file digest | File content is stable |
| Upload video analysis | 30 days when keyed by file digest and analysis mode | Expensive enough to reuse |
| Swipr background analysis | 30 days when keyed by file digest | Shared-library metadata is stable |

Do not pin entries until hit rates and storage growth are measured.

## Observability To Add

For the pilot, track:

- cache hit/miss by surface
- avoided provider calls by surface
- average latency on hit vs miss
- parse failures from cached responses
- cache storage growth
- manual invalidations by tag/model/prompt version

The component's built-in stats help with totals, but app-level analytics should
record the surface and whether the provider call was skipped.

## Risks

- The package is early and lightly adopted.
- Its examples are OpenAI-shaped, while ClipStitchr uses Replicate for most LLM
  calls. We can still cache app-defined request objects, but that should be
  verified with tests before relying on it.
- Current provider calls are in Next.js routes, so direct usage requires Convex
  wrapper functions or a larger move into Convex actions.
- Cached creative text can feel stale if users expect a new variation on every
  click.
- Cache keys that omit prompt versions, selected templates, media digests, or
  model IDs can return wrong outputs.

## Implementation Scope For A Pilot

Suggested first implementation:

1. Add the package and register the component.
2. Add one atomic Convex cache wrapper per operation.
3. Cache only product enrichment.
4. Add tests for cache hit, miss, prompt-version separation, and model
   separation.
5. Update `docs/backend/rate-limits.md`.
6. Measure hit rate before expanding to Clipr/Swipr/Stitchr text.

This keeps the blast radius small while proving whether the cache saves real
money for ClipStitchr's actual usage.
