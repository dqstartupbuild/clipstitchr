# RAG Evaluation

## Initial Request And Instructions

The evaluation prompt asked whether ClipStitchr can benefit from the Convex RAG
component, without implementing application code yet.

Requested behavior:

- If the component can help, create a Markdown document explaining the decision,
  expected benefits, risks, integration shape, and recommended use.
- If it cannot help, say no and explain why.
- Include these initial prompt instructions in the documentation.

User-provided component brief:

- Package: `@convex-dev/rag`
- Install command: `npm install @convex-dev/rag`
- Purpose: Retrieval-Augmented Generation and semantic search for AI products
  and agents.
- User-provided version: `0.7.2`.
- Checked npm on May 22, 2026: latest is `0.7.5`.
- Links:
  - https://www.npmjs.com/package/@convex-dev/rag
  - https://github.com/get-convex/rag
  - https://www.convex.dev/components/rag

## Recommendation

ClipStitchr can benefit from `@convex-dev/rag`, but not as a broad "add RAG to
everything" dependency.

The strongest fit is semantic retrieval over text metadata the app already
creates:

- shared Swipr background metadata
- private user media-library metadata
- avatar/photo descriptions
- product and generated-output metadata
- internal hook/template resources if the corpus grows
- public help docs if the app later adds an assistant-style support feature

The first pilot should be semantic search for the shared Swipr Background
Library. It is the cleanest fit because the product docs already say background
search should match name, tags, description, and visual details; the seeded
catalog can grow to 1,000 backgrounds; and the content is shared rather than
private per-user media. This proves value with a smaller authorization surface.

RAG should not be used to replace the current upload, stitching, or generation
pipelines. It does not process video frames, normalize media, generate images,
or reduce provider cost by itself. It retrieves relevant text context.

## What The Component Provides

The Convex RAG component provides:

- text content ingestion with chunking and embeddings
- vector semantic search
- namespaces for isolation, such as per-user or global search domains
- custom indexed filters
- importance weighting
- surrounding chunk context
- key-based content replacement with graceful migration
- async ingestion paths for larger content
- utilities such as default chunking, content hashing, MIME guessing, and
  hybrid rank fusion
- optional `generateText` integration for one-call search plus LLM response
  generation

The package is more mature than the earlier LLM cache component evaluated in
this repository. The public GitHub repo has hundreds of commits, and npm shows
active releases through `0.7.5` as of May 22, 2026.

Sources checked:

- https://www.npmjs.com/package/@convex-dev/rag
- https://github.com/get-convex/rag
- https://www.convex.dev/components/rag
- https://docs.convex.dev/agents/rag
- https://docs.convex.dev/search

## Best Initial Targets

### Swipr Background Library Search

Best first pilot.

Current product behavior:

- Swipr has a shared Background Library.
- Background records store name, tags, description, details, source, dimensions,
  and R2 object references.
- Seeded backgrounds already include structured search metadata.
- The feature guide explicitly says search should match name, tags,
  description, and visual details.

Why RAG helps:

- Users will search semantically, not just by exact tags. Examples: "bright
  kitchen with room for text", "minimal SaaS desk background", or "beauty
  counter with soft lighting".
- The planned seed catalog is large enough that exact substring search becomes
  limiting.
- Shared backgrounds can live in one namespace, reducing per-user isolation
  complexity for the first implementation.
- Filter values can preserve structured controls such as source, category,
  preset, niche, and style.

Suggested namespace:

```ts
"shared:swipr-backgrounds"
```

Suggested entry key:

```ts
`swiprBackground:${background.id}`
```

Suggested indexed filters:

```ts
[
  { name: "contentType", value: "swipr-background" },
  { name: "source", value: background.source },
  { name: "category", value: seedCategoryOrGeneratedCategory },
  { name: "preset", value: backgroundPresetId },
]
```

Suggested text:

```txt
Title: {name}
Tags: {tags}
Description: {description}
Details: {details}
Source: {source}
Dimensions: {width}x{height}
```

The search result should still return app-owned background records from Convex.
The RAG entry should help rank candidates; it should not become the source of
truth for the background object or authorization decision.

### Private Media Library Search

Good second target after the shared-background pilot.

Current app data already includes searchable metadata on `videoClips`,
`photoAssets`, `avatars`, `stitches`, `longrVideos`, `swipes`, and
`sharedMusicTracks`. For user-owned assets, RAG could support natural-language
search such as:

- "UGC in a car with a strong reaction"
- "demo clips for the finance product"
- "avatar photos in a kitchen"
- "clips with a person talking to camera"
- "stitches that use the launch demo"

This should use per-user namespaces and controlled server wrappers. Never allow
the client to pass an arbitrary namespace.

Suggested namespaces:

```ts
`owner:${ownerId}:media`
`owner:${ownerId}:photos`
`owner:${ownerId}:outputs`
```

Suggested filters:

```ts
contentType: "videoClip" | "photoAsset" | "stitch" | "longrVideo" | "swipe"
clipType: "ugc" | "demo"
productId: string
source: "upload" | "clipr" | "swapr" | "stitchr" | "longr"
```

This is useful once users have enough saved assets that tags and tabs are not
enough. It is probably not an MVP blocker.

### Internal Hook And Template Retrieval

Potential future target.

Clipr, Swipr auto-text, and Stitchr auto-text use hidden hook resources. The
current CSV template set is small enough that the existing product-enrichment
and template-pool approach is reasonable. RAG becomes useful if the internal
template/hook library grows substantially or if `assets/hooks/hook-library.json`
is converted into a curated internal retrieval corpus.

Possible use:

- Retrieve candidate hook templates by product context, audience, pain point,
  purpose, and risk level.
- Feed only the retrieved candidates into the existing text-generation prompt.
- Keep hook style names, template IDs, source names, and placeholder mechanics
  hidden from users.

Do not use RAG to expose the hook library directly in the UI.

### Public Docs Or Support Assistant

Future target, not immediate.

The app already has customer docs under `/docs`. RAG could power an "ask the
docs" assistant that answers questions about Stitchr, Swipr, Clipr, Swapr,
avatars, uploads, and rate limits.

This is a reasonable later feature, but it should not outrank product workflow
search. The current docs set is small enough that static pages and normal site
navigation are adequate.

## Poor Targets

Do not use the RAG component for:

- raw video or image understanding
- Media Bunny processing decisions
- replacing upload analysis
- replacing product enrichment
- replacing the hook-template engine
- choosing R2 objects without a Convex authorization lookup
- direct user access to hidden prompt resources
- automatically generating new media

RAG can retrieve metadata that was already produced by analysis. It cannot
inspect pixels or frames unless another model first converts those media assets
into text.

## Integration Shape

ClipStitchr already uses Convex components in `web/convex/convex.config.ts`.
Adding RAG follows that pattern, but it brings a few extra requirements:

- install `@convex-dev/rag`
- install the peer dependency `convex-helpers`
- choose and install an AI SDK embedding provider, such as `@ai-sdk/openai`
- add the embedding provider API key to server/Convex environment variables
- register the RAG component in `web/convex/convex.config.ts`
- create a typed RAG instance in a dedicated Convex module
- expose narrow wrapper actions/mutations instead of general-purpose RAG access

Use `rag.search()` first. Avoid `rag.generateText()` until the app has a clear
assistant or agent feature. The product currently needs semantic retrieval more
than generated answers.

Suggested wrapper functions:

- `indexSwiprBackgroundForSearch`
- `searchSwiprBackgroundsByMeaning`
- `removeSwiprBackgroundSearchEntry`
- `indexVideoClipForSearch`
- `searchOwnerMediaByMeaning`

Each wrapper should have one purpose and live in its own file if implemented,
matching the repository's Atomic Code Splitting rules.

## Rate Limit And Abuse Requirements

Any implementation must update `docs/backend/rate-limits.md`.

New or changed cost surfaces:

- embedding generation when indexing content
- embedding generation for semantic search queries
- Convex component reads/writes for entries and chunks
- scheduled cleanup of replaced entries
- optional provider LLM calls if `generateText()` is used later

Required protections:

- gate user-triggered indexing before embedding work
- rate-limit semantic search queries by user
- apply a global embedding-provider limit
- keep ownership checks separate from rate limits
- never let the client choose a raw namespace
- return clear `429` responses for HTTP route wrappers
- document any intentionally un-rate-limited operator-only backfill jobs

Suggested initial limits for a Swipr Background Library pilot:

| Surface | Suggested Limit | Reason |
| --- | --- | --- |
| Background search query embedding | 120/hour/user, burst 30; global 5,000/hour | Search is user-triggered and can create embedding cost |
| Background indexing | Existing background save/import limits plus global embedding limit | Indexing happens after background save or seed import |
| Operator reindex/backfill | Operator-only, secret-gated, paginated | Avoid public abuse and control embedding spend |

## Data And Privacy Considerations

RAG entries should store text metadata only, not raw media blobs.

Private user assets must be indexed in owner-scoped namespaces. Search wrappers
must derive `ownerId` from authenticated Convex/Clerk context. Do not accept
`ownerId` or namespace directly from client input.

Potential private data in entries:

- product details and audience details
- inferred product problems and pain points
- clip names and tags
- avatar visual descriptions
- photo outfit, pose, and location descriptions
- generated hook text and scripts
- swipe text and product context snapshots

Analytics should record search surface, result count, and hit/miss style
metadata only. Do not send user-entered queries or indexed content to PostHog
unless the privacy policy is updated for that purpose.

## Lifecycle Management

Use RAG keys for graceful replacement:

```ts
await rag.add(ctx, {
  namespace,
  key: `swiprBackground:${background.id}`,
  text,
});
```

When metadata changes, re-add with the same key so the new entry replaces the
old one. Add a scheduled cleanup path for replaced entries after a retention
window, following the component's lifecycle guidance.

For large backfills, use paginated internal jobs. Do not index every existing
record in one unbounded action.

## RAG Versus LLM Cache

The RAG component and LLM cache solve different problems:

- RAG retrieves relevant context from a corpus.
- LLM cache avoids duplicate provider calls for identical or normalized
  requests.

They can be complementary. For example, a future auto-text route could use RAG
to retrieve the best hook templates, then use an LLM cache for the final
text-generation request if the full prompt repeats. Neither should be treated
as a replacement for rate limits or authorization checks.

## Suggested Pilot

Recommended first implementation, when ready:

1. Add dependencies and register the component.
2. Add a single RAG instance configured for background metadata search.
3. Index only shared Swipr background records.
4. Add a semantic search wrapper that returns Convex background IDs and scores.
5. Merge semantic results with the existing exact search/filter behavior.
6. Add tests for namespace selection, filter handling, authorization, and
   no-result behavior.
7. Update `docs/backend/rate-limits.md`.
8. Measure result quality and embedding cost before indexing private user media.

## Decision

Yes, ClipStitchr can benefit from `@convex-dev/rag`.

It is most useful as semantic metadata retrieval infrastructure for growing
libraries, especially the Swipr Background Library and later private media
search. It should be adopted as a focused search pilot, not as a general AI
agent layer, and not before rate limits, namespace ownership, and indexing
lifecycle are designed.

