# Stitchr UGC Discovery Hook Standard

## Status

This document is the creative and product specification for Stitchr hook
generation. The format-specific library, retrieval priority, writing contract,
and output quality gate described below are implemented.

## Decision

Stitchr uses a hybrid hook system:

1. Keep the shared Hook Library as a source of tested creative mechanisms.
2. Add a curated set of 300 Stitchr-only UGC discovery patterns.
3. Use Stitchr retrieval and generation rules so every candidate fits the silent
   Hook/UGC-then-Demo format.
4. Reject any final overlay that sounds like brand copy, depends on voiceover or
   caption context, or creates a question the Demo cannot answer.

Adding more finished marketing hooks by itself will not solve the problem.
Updating only the prompt will also leave too many structurally incompatible
templates in the candidate pool. Stitchr needs both format-specific source
patterns and a stricter generation contract.

## The Stitchr Format

A Stitchr video has a narrow creative shape:

```text
Hook or UGC reaction clip -> product Demo clip
```

The generated overlay is the primary written hook. There is no generated
voiceover. The feed caption may add context after someone encounters the post,
but it cannot be required to understand the video.

This creates three jobs:

| Element       | Job                                                                          |
| ------------- | ---------------------------------------------------------------------------- |
| Hook/UGC clip | Supplies the face, emotion, behavior, tension, or reaction                   |
| Text overlay  | Supplies the viewer's private thought, confession, realization, or discovery |
| Demo clip     | Reveals what the creator found and closes the hook's specific open loop      |

The overlay should not describe the UGC clip or summarize the product. It should
make the reaction feel personally recognizable, then let the Demo explain why
the creator reacted that way.

## Core Philosophy

The viewer should feel that a creator discovered something useful, not that a
brand decided how to advertise a feature.

The creative progression is:

```text
private thought or confession -> genuine reaction -> Demo reveals the discovery
```

The product is the answer, not the speaker. The overlay should usually begin in
the creator's life before the product enters the story.

This is different from a normal ad hook:

| Brand-first hook                      | UGC discovery hook                                         |
| ------------------------------------- | ---------------------------------------------------------- |
| States the benefit                    | Reveals a personal realization                             |
| Sounds complete and polished          | Sounds like a thought caught in progress                   |
| Leads with the product or category    | Leads with behavior, tension, identity, or an excuse       |
| Explains why the viewer should care   | Makes the viewer recognize themselves                      |
| Can work over generic product footage | Needs the creator reaction and Demo to complete each other |

The goal is not to make the writing unclear. The thought can be conversational
or unfinished in tone, but the Demo must provide the missing answer immediately.

## Native UGC Hook Mechanisms

Stitchr should favor mechanisms that feel natural over a creator reaction.

### Self-callout

The creator catches themselves doing something unhelpful or absurd.

Formula:

```text
me/not me + recognizable behavior or mistake
```

Example:

> me opening this after saving 47 workouts I never did

### Reluctant realization

The creator admits that an excuse, assumption, or habit no longer holds up.

Formula:

```text
I fear/apparently/so + uncomfortable realization
```

Example:

> I fear "I don't know what to train" is no longer an excuse

### Expectation reversal

The creator expected the product or process to be intimidating, generic, or
unhelpful, then the Demo reveals something more fitting.

Formula:

```text
I expected X -> wait, it actually does Y?
```

Example when the Demo visibly shows level placement:

> wait... it starts me at my actual level?

### Embarrassing simplification

The creator realizes they made the problem more complicated than it needed to
be.

Formula:

```text
so/apparently + old behavior + was not the real solution
```

Example:

> so random push-ups were not, in fact, a workout plan

### Excuse removal

The creator reacts to losing a familiar reason for avoiding action.

Formula:

```text
I cannot use [relatable excuse] anymore
```

Example:

> not me losing my "I need a gym" excuse

### Identity loop

The creator recognizes a repeating version of themselves and hints that the
Demo may interrupt it.

Formula:

```text
me + recurring identity behavior
```

Example:

> not me restarting my calisthenics phase every Monday

### Discovery question

The creator reacts to one concrete, visible product behavior. This works only
when the Demo answers the question immediately.

Formula:

```text
wait/you are telling me + specific supported discovery?
```

Example when the Demo shows a beginner-level plan:

> you're telling me I needed a plan, not a gym?

## Voice and Style

A strong Stitchr overlay should:

- Sound like something a creator might type over their own reaction.
- Use first-person, `me`, `POV`, or conversational question framing when it fits
  the visible clip.
- Center a recognizable behavior, insecurity, assumption, excuse, or identity.
- Use natural internet language without forcing slang.
- Contain enough specificity to make the intended viewer feel seen.
- Let the product remain unnamed until the Demo whenever possible.
- Be short enough to read during the Hook/UGC clip.
- Create only an open loop the following Demo can visibly close.
- Match the intensity and expression of the selected Hook/UGC clip.
- Stay within product facts and observed clip evidence.

Conversational does not mean randomly lowercase, grammatically broken, or full
of trendy phrases. The writing should feel unpolished in perspective, not
careless in meaning.

## What Stitchr Should Reject

### Product headlines

These sound like a brand summarizing its value:

- "A daily workout that fits your level"
- "For beginners who never know where to start"
- "The easier way to train at home"

### Polished problem-and-solution copy

These are understandable but feel written by a marketing team:

- "No gym. No guessing. Just today's workout."
- "Home workouts finally come with a plan."

### Unresolved explanation hooks

These promise narration or long-form context the format does not contain:

- "If bodyweight exercises feel aimless, this is why."
- "Here is what nobody tells you about calisthenics."
- "Let me explain why your workouts are not working."

### Empty curiosity

These do not give the Demo a meaningful question to answer:

- "Wait for it."
- "You need to see this."
- "This changes everything."

### Fabricated creator experience

Do not invent a duration, result, purchase, recommendation, or personal history
that is not supported by the selected clip or approved product context:

- "I used this for 30 days and transformed my body."
- "Everyone kept telling me to download this."
- "This is the only app that ever worked for me."

### Demo mismatch

Even a strong creator-style line fails when the selected Demo cannot resolve it.
A hook about saving money cannot lead into a level-placement screen. A hook
about automatic rep tracking cannot lead into a static daily workout unless the
product truth and Demo both support tracking.

## The Demo-Closure Test

Every generated option must pass this test:

> After reading the overlay over the creator reaction, can a sound-off viewer
> understand exactly what the next Demo reveals?

The evaluator should ask:

1. What private thought or tension does the overlay establish?
2. What specific question does it leave open?
3. Which visible moment in the Demo answers that question?
4. Does the answer rely on voiceover or the feed caption?
5. Is every implied product behavior supported?

Reject the hook if question 3 has no concrete answer or question 4 is yes.

The feed caption can deepen the story, add context, or invite conversation. It
must not repair an overlay that failed this test.

## Hook Library Strategy

The shared Hook Library should remain a source of mechanisms, emotional
triggers, and sentence shapes. It should not be treated as a collection of
finished Stitchr overlays.

### Stitchr-specific patterns

The `ugc_discovery_patterns` source contains 300 patterns built for:

- self-callout;
- reluctant discovery;
- expectation reversal;
- embarrassing realization;
- excuse removal;
- recurring identity behavior;
- a concrete discovery question.

These templates are available only when `allowedPurposes` includes `stitchr`.
They use audience behavior and clip evidence more often than product-name or
feature placeholders.

The IDs encode three creator families, ten conversational openers per family,
and ten discovery patterns per opener. Retrieval uses those coordinates instead
of sorting equal scores by ID. A full candidate set contains 12 discovery
patterns balanced across the three families, avoids repeating the same opener
coordinate, and adds 6 supporting shared patterns.

### Filter the shared library

Shared templates may still enter the Stitchr candidate pool when they can be
rewritten into the discovery format. Retrieval penalizes or excludes
templates that:

- require spoken explanation;
- lead with a product name or direct feature promise;
- depend on a long story setup;
- use vague demonstratives such as "this" without a visible referent;
- require proof unavailable in the Demo;
- sound like a headline, tutorial introduction, or brand claim.

### Rewrite before use

The model extracts the candidate's mechanism and writes a new creator
thought from the selected UGC tension and Demo proof. It should never paste a
library sentence with only the placeholders filled.

## Generation Contract

Stitchr generation uses this order:

1. Read the selected Hook/UGC clip for visible emotion, expression, action, and
   relatable tension.
2. Read the Demo for the strongest concrete product behavior it visibly proves.
3. Retrieve an opener-balanced set of format-compatible discovery mechanisms
   from the Hook Library.
4. Use the stable task or clip seed to assign one varied winning mechanism.
5. Draft multiple first-person or creator-perspective thoughts.
6. Remove product names and polished benefit language unless essential.
7. Score each draft for creator voice, viewer recognition, visual fit,
   Demo closure, readability, and product truth.
8. Reject any draft that needs voiceover or caption context.
9. Return compact JSON with distinct options and no visible analysis, notes,
   scoring, drafts, or checklist.

The option labels describe creator angles rather than generic marketing
categories. Available directions include:

- Self-callout
- Reluctant discovery
- Expectation reversal
- Excuse removed
- Identity moment

`Relatable`, `Curiosity`, and `Bold` are too broad to guarantee a native
Stitchr result.

## Quality Gate

A final overlay should ship only when all answers are yes:

- Does it sound like the creator's thought rather than the product's headline?
- Does it make sense with no voiceover?
- Can it be understood without opening the feed caption?
- Does the selected UGC expression or action support its tone?
- Does the Demo visibly resolve its open loop?
- Is the implied product behavior supported by product details?
- Is it specific enough that the target viewer can recognize themselves?
- Is it free of fabricated testimony, results, statistics, and social proof?
- Would it still feel natural if the product name were removed?

The last question is a creator-voice test, not a rule that the product must
always remain unnamed.

## Output Resilience

Stitchr asks the writing model for compact JSON and gives it a Stitchr-specific
completion allowance. A complete JSON object can still be extracted when the
provider adds prose before it.

If the provider returns malformed or token-truncated JSON, ignores the assigned
winner ID or opener, or fails to complete the writing request, the same task can
make one additional JSON-only writing attempt. The server validates the assigned
ID and exact opener words after parsing, so valid JSON cannot bypass Batch
diversity. If the second attempt also fails its response contract, the server
creates a deterministic fallback from the assigned Hook Library mechanism. It
uses product facts when they are available and preserves the assigned opener
with a safe creator thought when sparse product data cannot fill the mechanism.
No third provider call is made.

## Guppy Pairing Examples

These examples show why the Demo determines whether a hook works.

| Demo evidence                   | Compatible discovery overlay                                 |
| ------------------------------- | ------------------------------------------------------------ |
| Beginner level placement        | "wait... it starts me at my actual level?"                   |
| A daily workout and rep targets | "I fear 'I don't know what to train' is no longer an excuse" |
| A structured home workout       | "so random push-ups were not, in fact, a workout plan"       |
| Progress logging                | "not me finally keeping track instead of starting over"      |

These are pattern examples, not permanent Guppy copy. Generation should adapt
the language to the selected UGC reaction and the exact Demo evidence.

## Relevant Code

The current Stitchr hook path is implemented in:

```text
web/lib/clipstitchr/resources/clipr/
  rawUgcDiscoveryHookTemplates.ts
  ugcDiscoveryHookOpenerFamilies.ts
  cliprHookTemplates.ts
web/lib/clipstitchr/server/
  StitchrHookContractError.ts
  createStitchrAssignedOpenerFallbackHook.ts
  createCliprTextGeneration.ts
  createStitchrFallbackGenerationOutputText.ts
  createStitchrHookGenerationPrompt.ts
  createStitchrFallbackHook.ts
  getCliprJsonText.ts
  getStitchrHookMatchesAssignedOpener.ts
  getStitchrHookVariationIndex.ts
  getStitchrExclusiveHookTemplates.ts
  getStitchrHookTextIsUsable.ts
  getStitchrHookTemplateRelevanceScore.ts
  getUgcDiscoveryHookCoordinates.ts
  getUgcDiscoveryHookOpener.ts
  normalizeStitchrHookOpenerText.ts
  selectStitchrHookCandidates.ts
  normalizeStitchrHookOptions.ts
  formatStitchrTextGenerationClipContext.ts
web/lib/clipstitchr/utils/
  createStitchrTextGenerationClipContext.ts
web/lib/clipstitchr/types/
  CliprHookTemplate.ts
  StitchrTextGenerationClipContext.ts
web/app/api/clipr/text/
  route.ts
web/services/provider-worker/
  runProviderWorker.ts
```

The existing behavior and caption contract are documented in:

- `docs/features/stitchr/stitchr-social-captions.md`
- `docs/features/platform/audience-first-generation.md`
- `docs/features/clipr/clipr.md`

## Implementation Notes

- Keep each new scorer, classifier, contract, or template source in its own
  single-purpose file.
- Reuse the same prompt and evaluation contract for manual, automated, and Batch
  Stitchr so hook quality does not vary by entry point.
- The candidate selector sends 12 discovery patterns and 6 supporting shared
  patterns to the model when enough of each are available. The discovery set
  uses 4 candidates from each creator family without repeating an opener
  coordinate.
- Batch task IDs end in their one-based position. That position assigns a stable
  winner lane, so tasks 1 through 10 do not all inherit the first library
  opener, while a retry of the same task keeps the same creative direction.
- The text quality gate rejects explanation-dependent hooks, empty curiosity,
  common brand language, vague demonstrative openings, and text without a
  creator-perspective signal.
- The server also rejects a winner whose template ID or exact opener does not
  match its assigned lane. That rejection uses the same one-retry ceiling.
- The existing server-side generation and Batch limits remain in front of the
  task. One output can make at most two writing predictions, so the current
  ceilings bound worst-case writing attempts to 200 per owner-local day and
  2,000 globally per day. The retry does not consume a second output quota or
  creation credit.
- The Next app and provider worker must use the same release because automated
  Stitchr generation imports the shared writing path. The media worker does not
  import or execute hook generation.

## Verification

Use a matrix of Hook/UGC reactions and Demo proof types:

1. Generate hooks with no voiceover and ignore the feed caption during review.
2. Confirm every overlay reads naturally over the selected reaction.
3. Confirm the first visible Demo moment closes the overlay's specific loop.
4. Confirm none of the options read like a product headline or feature summary.
5. Confirm each option uses creator perspective without inventing personal
   results or unsupported history.
6. Confirm irrelevant library templates never reach the model or are rejected
   before output.
7. Confirm changing only the Demo changes the discovery being teased.
8. Confirm changing only the Hook/UGC reaction changes the voice and emotional
   framing without changing product truth.
9. Test manual Stitchr, automated Stitchr, and Batch Stitchr with the same clip
   pairs.
10. Generate candidate sets for Batch positions 1 through 10 and confirm all ten
    assigned winner IDs differ and no opener dominates the run.
11. Feed the parser a provider preamble followed by complete JSON and confirm the
    JSON is recovered.
12. Simulate two truncated responses and confirm the task returns a usable,
    scriptless fallback without making a third provider call.
13. Return valid JSON with a `not me` winner for a different assigned opener
    and confirm the server rejects it, retries once, and then uses the assigned
    fallback if necessary.
14. Fail the provider during the repair attempt and confirm the task still
    returns its grounded fallback.

## Sources

- Current Stitchr generation behavior:
  `docs/features/stitchr/stitchr-social-captions.md`
- Shared audience-first writing rules:
  `docs/features/platform/audience-first-generation.md`
- Hook template model and sources: `docs/features/clipr/clipr.md`
- Product format and UGC-then-Demo sequence: `project-scope.md`
- Creative direction clarified through product review of generated Guppy
  Stitchr hooks on July 25, 2026.
