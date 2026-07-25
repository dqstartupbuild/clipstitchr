# Audience-First Generation

ClipStitchr text generation should make the audience and problem the script
spine. Product details are context and proof, not the default topic.

## Philosophy

Short-form text should sound like a person with a point of view. A generated
Clipr script, Swipr deck, or Stitchr overlay should be able to stand on audience
tension alone: a belief, mistake, identity claim, comparison, story, or useful
reframe.

Product information should answer:

- Who is this for?
- What problem space are they in?
- What does the audience already believe?
- What mistakes or habits are keeping them stuck?
- What proof can support the content when a product mention is allowed?

Product information should not become:

- A repeated feature list.
- A product description paraphrase.
- A script that always returns to the same onboarding steps, scans, dashboards,
  generated plans, or feature names.
- A hook that only works because the product is named.

## Purpose Rules

Clipr is creator-style value, opinion, story, or reframe content. It should not
mention the product name or product-specific mechanisms by default. The product
is background context used to infer the audience and problem.

Swipr starts as creator/value content and may close with one soft product CTA on
the final slide. The hook and middle slides should validate the audience claim
without sounding like product copy.

Stitchr overlays should read like a creator's private thought, confession,
self-callout, or reluctant discovery over a silent Hook/UGC-then-Demo sequence.
The Demo must visibly close the overlay's specific open loop. The text must not
depend on voiceover or the feed caption, and it should not read like a product
headline.

## Generation Shape

Each generation should silently choose one angle:

- Polarizing belief
- Beginner mistake
- Unpopular opinion
- Confidence or status
- Myth busting
- Story or confession
- Hard truth
- Comparison
- Tactical tip
- Identity callout

Each generation should also follow one content arc:

- Hot take -> wrong belief -> better reframe
- Callout -> behavior -> consequence -> fix
- Story/confession -> mistake -> realization -> lesson
- Comparison -> old way -> new way -> why it matters
- Myth -> truth -> practical next step
- Identity challenge -> emotional reason -> behavior change

This keeps the hook from changing while the rest of the script collapses back
into the same product talking points.

## Placeholder Fillers

Product enrichment should produce audience-first fillers:

- `core_belief`, `common_assumption`, and `controversial_take` should contain
  claims the audience would defend or resist.
- `popular_method`, `habit`, `workflow`, and `task` should describe what the
  audience actually does, not the product's feature list.
- `topic`, `thing`, and `category` should prefer problem language over product
  language.
- Product names should mainly live in `product_name` and final-CTA contexts.

## Generated Writing Quality Gate

All user-facing generated hooks, captions, scripts, descriptions, and product
enrichment strings pass through a shared writing-quality gate before they are
saved or returned. Prompts tell the model to rephrase sentences that would use
an em dash. If one still appears, the gate chooses punctuation from the sentence
structure: commas for dependent turns, colons for explanations, periods for
separate thoughts, and commas around parenthetical phrases. The gate also
rejects known canned AI phrases, including generic hype, stock contrast lines,
and template introductions. A rejected short field uses supplied product or
clip context when a safe fallback exists. A rejected batch hook without
trustworthy context is dropped instead of being replaced with a generic
reaction line.

Prompt builders use the same anti-slop rules. They tell the model to avoid
padding and generic conclusions and remove any line that could belong to an
unrelated product. Swipr still aims for 1000-2000 characters of long-form post
copy, but every paragraph must add a distinct supported idea. When the context
cannot support that length honestly, shorter copy is allowed. Emojis and
hashtags are optional.

## Future Additions

When adding new templates or generation surfaces, keep product proof isolated
from content structure. Add new angles or arcs when a pattern is genuinely
different, but do not solve repetitive output by adding more product-specific
phrases.
