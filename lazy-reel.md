# LazyReel Review for ClipStitchr

Reviewed on July 21, 2026 from:

```text
/Users/starship/Downloads/lazyreel-master
```

This note is a product and architecture review. Nothing from LazyReel was
copied into ClipStitchr as part of the Hook Lab implementation.

## Recommendation in one sentence

The best idea to borrow is a workflow that turns a saved Hook Lab analysis into
reusable format DNA, then adapts that structure to one of the user's saved
products for Clipr, Stitchr, or Swipr without copying the source creator's words
or inventing product claims.

## What is useful in LazyReel

LazyReel separates short-form research into three layers:

1. Evidence about the source post: hook, visuals, text, audio, metrics, and
   timeline.
2. A reusable format description: opening device, narrative beats, proof device,
   product role, payoff, and edit rhythm.
3. A product-specific brief: new hook options, voiceover, on-screen text,
   footage needs, and a CTA grounded in the new product.

ClipStitchr already has most of layer 1 in Hook Lab and already owns the
generation tools needed for layer 3. The missing bridge is layer 2.

The most relevant LazyReel files were:

- `mcp/src/frameworks.ts`: script frameworks, hook patterns, awareness levels,
  product roles, anti-slop rules, and false-positive checks.
- `mcp/src/skills.ts`: examples of turning research into hook banks and shoot
  briefs.
- `skills/lazyreel-format-deconstructor/SKILL.md`: the clearest description of
  reusable format DNA.
- `skills/lazyreel-ugc-ad-director/SKILL.md`: a multi-clip brief format with a
  reason for every shot.
- `skills/lazyreel-video-editor/SKILL.md`: an edit decision list that connects
  hook intent to trim, crop, cut, caption, and audio decisions.
- `mcp/pipeline/ingest-apify.mjs`, `llm-label.mjs`, and `visual.mjs`: the batch
  research pipeline.
- `mcp/data/breakout-vs-dud.json`: the five first-three-second hypotheses and
  their reported validation.

## Highest-value feature: Use this format for my product

Add a future action to each completed Hook Lab report:

```text
Use this format
  -> choose a saved product
  -> choose Clipr, Stitchr, or Swipr
  -> review a generated creative brief
  -> create the draft in the selected tool
```

The source post should contribute structure only:

- the visual question or tension in the opening;
- the type and timing of the first payoff;
- the story beats and their order;
- the proof device;
- the format and edit pattern;
- the role and entry point of the product;
- the CTA style;
- the signature device that makes the idea memorable.

The saved ClipStitchr product should remain the only source of product facts,
claims, audience details, pain points, and benefits. The generated draft should
never reuse the creator's caption, spoken lines, or distinctive phrasing unless
the user explicitly authored that source material.

### Suggested format-DNA fields

Add a versioned `formatDna` object to a completed Hook Lab analysis in a future
schema change:

```text
openingVisual
openingQuestion
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

Keep observations and inferences separate. That is more valuable than one
opaque score and fits the honesty rules already used by Hook Lab.

### How each ClipStitchr tool could use it

| Destination | Adaptation |
| --- | --- |
| Clipr | Create a natural spoken script that keeps the source beat order and opening mechanism while using the saved audience and problem. |
| Stitchr | Select a hook template and short overlay that match the source's opening device, then pair it with existing UGC and Demo clips. |
| Swipr | Turn slideshow or video beats into a slide plan, preserving tension, proof, and payoff while writing original slide copy. |
| Hook Library | Show related templates based on hook intent, emotional trigger, risk, and best use. |

## Improve Hook Lab analysis depth

The new caption and on-screen-text fields make several useful additions
possible without another media download.

### 1. First-three-second breakdown

Add a short section that answers:

- What is visible in the first frame?
- What question or tension is still unresolved?
- What text must work with sound off?
- When does the viewer get the first taste of the payoff?
- Does the post announce that it is an ad, review, or tutorial before earning
  attention?

LazyReel's five opening rules are useful as hypotheses for this section, but
ClipStitchr should not present them as guaranteed laws until they are replicated
against ClipStitchr's own data.

### 2. Proof and product role

Classify how the post proves its point:

- visible demo;
- before and after;
- screen recording;
- specific numbers;
- testimonial;
- comparison;
- no clear proof.

Also classify the product as the hero, helper, proof, background, punchline,
CTA-only, or absent. This can directly guide where a user's product should
enter a new piece of content.

### 3. Signature device

Name the single moment or object that the whole post depends on. Examples are a
mirror check, a side-by-side result, an unusual prop, a screen-recorded reveal,
or one slide that changes the meaning of the slides before it.

This is a more practical creative input than a generic statement such as “use a
strong hook.”

### 4. Copyability warning

Add a low-cost warning when a popular post may be a poor model to copy:

- public views are high but shares and comments are unusually weak;
- the premise depends on a known personality or borrowed clip;
- the product is unnecessary to the post's success;
- the trend or sound appears to carry the idea;
- proof arrives only at the end;
- the post gets attention but does not establish product relevance.

These should be labeled as possible issues, not facts, because Hook Lab does not
currently know paid reach, creator medians, retention, or conversion data.

## Build a product-content bridge

The most useful long-term Hook Lab outcome is not another report. It is an
approved creative brief that can become content.

### Suggested flow

1. User analyzes one or more reference posts.
2. User selects a saved product.
3. ClipStitchr extracts the shared structural patterns across the references.
4. ClipStitchr offers three original directions, each with a different Hook
   Library category.
5. User chooses one direction.
6. ClipStitchr creates a versioned brief with:
   - opening visual;
   - hook and sound-off overlay;
   - beat-by-beat script;
   - footage or generation needs;
   - product proof;
   - CTA;
   - destination tool.
7. The user sends the brief to Clipr, Stitchr, or Swipr.
8. The finished post keeps lineage back to the reference analyses and selected
   Hook Library template.

This would make Hook Lab the research entry point for the rest of the product,
instead of a useful report that ends in a dialog.

### Suggested durable records

Do not pack this into `hookLabPosts`. A separate, owner-scoped concept or brief
record would keep responsibilities atomic:

```text
hookLabCreativeBriefs
  ownerId
  productId
  sourcePostIds[]
  hookTemplateId
  formatDnaVersion
  destinationTool
  brief
  status
  createdAt
  updatedAt
```

Any generation endpoint would need its own authorization, per-user limit,
global provider-spend limit, creation-credit behavior, and documentation before
the provider call.

## Personalized learning loop

LazyReel's strongest analytical principle is to compare a creator against their
own baseline instead of ranking unrelated creators by raw views. ClipStitchr can
eventually do this more reliably with first-party user data:

- connect Hook Lab references to content produced from them;
- connect generated content to Post Bridge publishing and analytics;
- compare hook pattern, format, proof device, and product-entry timing within
  the same product/account;
- learn which structures beat that account's normal performance;
- use those results to rerank Hook Library suggestions for that user.

This is more defensible than importing a universal “viral score.” It also
creates a compounding product advantage because recommendations improve from
the user's own outcomes.

Do not begin with an opaque model. Start with transparent counts and minimum
sample requirements, for example: “This opening style beat your account's
typical saves in 4 of 6 posts.”

## Hook Library opportunities

ClipStitchr already has a larger hook-template catalog than LazyReel's compact
taxonomy. The useful move is to enrich the existing catalog, not replace it.

Possible additions:

- map each of the 16 ClipStitchr categories to a broader narrative framework;
- add product role, proof device, awareness level, and sound-off suitability;
- show three “related hooks” on a completed Hook Lab report;
- add “Use with this product” from a library card;
- add saved/favorite hooks and recently used hooks;
- prevent recent template repetition across generated drafts;
- record which hooks were used in Clipr, Stitchr, and Swipr so the library can
  become a real creative history.

Pagination should remain server-side and bounded. Do not send the whole catalog
to the browser as metadata grows.

## Batch research collections

LazyReel's pipeline shows the value of studying groups instead of single viral
posts. A future Hook Lab collection could let a user group 5 to 30 analyzed
posts by competitor, campaign, niche, or product and receive:

- recurring hook and format patterns;
- common on-screen wording without copying full captions;
- proof devices and product roles;
- overused patterns;
- missing content opportunities;
- three original directions for the user's product.

Use the analyses already stored in Convex. Do not re-download the media for an
aggregate report. Enforce a minimum sample before displaying comparisons and
show the sample size with every conclusion.

## What should not be copied blindly

LazyReel is MIT licensed, but the current snapshot contains data and product
claims that need independent verification before production use.

### Data quality issues found

- `word-insights.json` contains subtitle artifacts such as “utterances text,”
  “start time,” and “end time.” Its overall winning-word lists are empty. The
  word layer needs better subtitle cleanup before it can guide copy.
- The visual aggregate covers 237 videos. Most niche slices contain about 23 or
  24 videos, so some very large lift values come from only three winning
  examples. Always show sample size and confidence; do not turn those numbers
  into universal rules.
- The public examples include missing or generic hook labels. The corpus filter
  uses permissive substring matching, and a missing label can pass a requested
  filter because an empty string matches every string.
- Views divided by followers can explode for very small accounts. That signal
  needs minimum-follower rules, creator-median comparison, winsorization, and
  suspicious-spike checks before it is used for ranking.
- Some repository statements are stale or inconsistent. The status copy says
  visual decoding is not built, while a visual aggregate is present. One
  methodology file says URLs are not committed, while `examples.json` contains
  public TikTok URLs.
- The hook-writing functions are deterministic template fillers. Their
  architecture is useful, but their generated lines are not automatically
  better than ClipStitchr's current model-backed, product-grounded writing.
- The reported opening validation used a model judging extracted frames. It is
  interesting evidence, but it is not the same as blinded human ratings,
  retention data, conversions, or a platform experiment.
- The repository snapshot was generated on May 24, 2026. Treat its trend data as
  a snapshot, not a live signal.

### Product claims to avoid

Do not promise that one hook causes virality, that a fixed cut interval always
wins, or that a raw lift value predicts a user's results. ClipStitchr should say
what was observed, what is inferred, how many examples support it, and what data
is missing.

## Practical delivery order

### Phase 1: valuable and low risk

1. Extend Hook Lab analysis with format DNA, proof device, product role,
   signature device, sound-off opening, observations, and inferences.
2. Show related Hook Library templates in a completed report.
3. Add “Use this format” to create an editable brief for one saved product.
4. Send an approved brief into Clipr, Stitchr, or Swipr.

### Phase 2: compounding workflow

1. Save creative briefs as their own owner-scoped records.
2. Add multi-reference Hook Lab collections.
3. Track which reference, template, and brief produced each output.
4. Add favorites, recent use, and repetition controls to the Hook Library.

### Phase 3: evidence from user outcomes

1. Connect generated outputs to Post Bridge analytics.
2. Build within-account and within-product baselines.
3. Rerank formats and hooks using the user's own results with minimum samples.
4. Show transparent evidence instead of a universal viral score.

## Final assessment

LazyReel is most valuable as a design reference for the research-to-brief
pipeline. ClipStitchr already has stronger foundations for the actual product:
saved product context, a large hook catalog, provider-backed writing, media
generation, editing, scheduling, analytics, ownership checks, credits, and rate
limits.

The right move is to connect those pieces through a versioned format-DNA and
creative-brief workflow. Importing LazyReel's static metrics or deterministic
copy generator would add more uncertainty than value. Borrow the workflow,
replicate the promising hypotheses against ClipStitchr data, and let user-owned
performance become the long-term ranking signal.
