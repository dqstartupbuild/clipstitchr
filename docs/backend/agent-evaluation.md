# AI Agent Component Evaluation

## Initial Request And Instructions

The evaluation prompt asked whether ClipStitchr can benefit from the Convex AI
Agent component, without implementing application code yet.

Requested behavior:

- If the component can help, create a Markdown document explaining the decision,
  expected benefits, risks, integration shape, and recommended use.
- If it cannot help, say no and explain why.
- Preserve the "do not actually do anything yet" boundary by changing
  documentation only.

User-provided component brief:

- Package: `@convex-dev/agent`
- Install command: `npm install @convex-dev/agent`
- Purpose: AI agents with persistent threads, messages, streaming, tool calls,
  conversation context, vector search, usage tracking, and rate limiting.
- User-provided version: `0.6.1`.
- Checked npm on May 22, 2026: latest is still `0.6.1`.
- Links:
  - https://www.npmjs.com/package/@convex-dev/agent
  - https://github.com/get-convex/agent
  - https://www.convex.dev/components/agent

## Recommendation

ClipStitchr can benefit from `@convex-dev/agent`, but not for the current core
MVP workflows.

The component is best deferred until ClipStitchr intentionally adds a
conversational or agentic product surface, such as:

- an in-app support/docs assistant
- a creative strategy assistant for planning ad variants
- a guided Clipr/Swipr/Stitchr briefing assistant
- a human-in-the-loop support thread that can inspect user workspace metadata
- a future autopilot planner that proposes, schedules, and explains generation
  runs

It should not be installed just to replace today's route-based generation
helpers. The current app mostly uses structured, form-driven, single-purpose AI
operations: product enrichment, upload analysis, text generation, avatar photo
generation, background generation, shared music upload, and Swapr/Clipr provider
jobs. Those flows already have explicit inputs, deterministic ownership checks,
rate limits, and typed persistence. Wrapping them in an agent abstraction would
add thread/message state without solving the main reliability problem: durable
provider finalization and media processing.

Short version: yes, this is useful for a future assistant. No, it should not be
the next backend component to adopt for the current ClipStitchr MVP.

## What The Component Provides

The Agent component provides:

- agent definitions that encapsulate model, prompt, tool, and behavior
  configuration
- persistent threads and messages
- automatic conversation context
- hybrid vector/text search across thread messages
- streaming text and object deltas over Convex websockets
- tool calls, including human-in-the-loop tool approval patterns
- file support in thread history
- debugging through callbacks, playground, and dashboard inspection
- usage tracking through `usageHandler`
- rate-limit integration patterns with the Convex Rate Limiter component
- compatibility with the RAG component for external retrieval
- workflow patterns when paired with the Convex Workflow component

The package is mature relative to small third-party components. At evaluation
time, the GitHub repository had about 1,591 commits, 330 stars, and 85 forks,
and npm reported `0.6.1` as the latest release. It is Apache-2.0 licensed.

Sources checked:

- https://www.npmjs.com/package/@convex-dev/agent
- https://github.com/get-convex/agent
- https://www.convex.dev/components/agent
- https://docs.convex.dev/agents
- https://docs.convex.dev/agents/getting-started
- https://docs.convex.dev/agents/agent-usage
- https://docs.convex.dev/agents/tools
- https://docs.convex.dev/agents/workflows
- https://docs.convex.dev/agents/rate-limiting
- https://docs.convex.dev/agents/usage-tracking

## Best Future Targets

### Support And Docs Assistant

Best first agent pilot.

Why it fits:

- The app already has public docs for Stitchr, Longr, Clipr, Swipr, Swapr,
  avatars, and rate limits.
- Users will ask follow-up questions that benefit from thread history.
- The assistant can use RAG over public docs without touching private user
  media in the first version.
- Threads make sense because support conversations naturally persist across
  sessions.

Recommended scope:

- One `supportAgent`.
- Public-doc RAG context only.
- No write tools.
- No private workspace access in the first version.
- Clear disclaimers when answers depend on account-specific state.
- Strict rate limits for message count and token usage.

This is a safer first pilot than an autonomous media-generation agent.

### Creative Brief Assistant

Good second target.

This would help a user think through:

- which product to use
- which UGC clips might pair with a demo
- what text overlay angle to try
- whether a Swipe, Clip, Stitch, or Long is the better next output
- how to interpret existing product/audience metadata

This should be advisory first. It can retrieve product metadata, clip metadata,
and docs, but it should not create expensive provider jobs without explicit user
confirmation.

Potential tools:

- `searchOwnerMediaByMeaning`
- `listProductsForCurrentUser`
- `listRecentStitches`
- `draftStitchrOverlay`
- `draftSwiprSlides`

Every tool should be scoped to the authenticated owner and should return compact
metadata, not media blobs.

### Guided Generation Thread

Possible later target.

An agent could collect missing inputs through conversation before launching a
Clipr, Swipr, or Stitchr workflow. For example:

- ask which product the user wants to promote
- ask whether the output should be educational, direct response, or carousel
- suggest candidate backgrounds or UGC clips
- produce a draft plan
- request confirmation before starting provider work

The important boundary: the agent can plan, but the final action should call
existing typed route/Convex workflows after explicit confirmation. It should not
freely call generation tools in a ReAct loop.

### Future Autopilot Planner

Possible later target, but not a first implementation.

Docs already describe future automation/provider workflows. An agent could help
explain or plan an automation run, but reliable execution should still be owned
by durable job/workflow infrastructure.

The Agent component alone does not replace:

- provider job tables
- idempotent finalizers
- Replicate webhooks
- R2 object copies
- server-side media workers
- Cloud Tasks or Cloud Run executor/finalizer paths

If autopilot becomes a product requirement, evaluate the Convex Workflow
component separately. The Agent component can live inside a workflow step, but
it is not the durable workflow engine by itself.

## Poor Current Targets

Do not use the Agent component now for:

- upload normalization
- Media Bunny stitching or Longr rendering
- Swapr video job execution
- avatar photo generation execution
- Swipr background generation execution
- Clipr provider orchestration as currently implemented
- shared music upload and selection
- product enrichment as a single-turn form submit
- upload metadata analysis

These are not conversational agent problems. They are typed backend operations
with explicit inputs and cost surfaces. Adding threads/messages would increase
state and debugging surface without making provider outputs more durable.

## Fit Against Existing Architecture

ClipStitchr already has:

- Convex as the metadata ledger
- Clerk-authenticated routes
- explicit Convex rate-limit mutations
- typed job records for Clipr
- Replicate job records for selected provider workflows
- R2 object persistence
- documented durable workflow targets

The Agent component overlaps with only part of that:

- it helps with threaded conversation state
- it helps with AI SDK usage tracking
- it helps with tool-call organization
- it can integrate with RAG
- it can participate in workflows

It does not directly solve the app's most important backend gaps:

- browser refresh can still interrupt some provider-output save paths
- route-local long-running provider calls can still fail mid-orchestration
- final provider outputs still need idempotent server-side copies to R2
- Media Bunny render jobs still need a server worker or resumable browser queue

For those gaps, the existing durable workflow docs point in the right direction:
provider job records, finalizers, webhooks, Cloud Tasks/Cloud Run, and media
workers.

## Integration Requirements

If adopted later, the component would require:

- `@convex-dev/agent`
- the `ai` package
- `convex-helpers`
- `@ai-sdk/provider-utils`
- at least one AI SDK model provider, such as `@ai-sdk/openai`
- matching provider API keys in server and Convex environments
- registration in `web/convex/convex.config.ts`
- codegen through `npx convex dev` or equivalent

The current app uses the `replicate` SDK directly for most provider calls. Using
the Agent component would introduce AI SDK model configuration alongside the
existing Replicate wrappers. That is acceptable for a support assistant, but it
is not a drop-in replacement for the existing Replicate image/video paths.

## Rate Limit And Abuse Requirements

Any future agent feature must update `docs/backend/rate-limits.md`.

New or changed cost surfaces:

- message creation
- token usage per user
- global provider token usage
- tool calls that read workspace metadata
- tool calls that create or mutate records
- RAG searches and embedding generation if the agent retrieves external context
- any generation tool exposed to the agent

Required protections:

- rate-limit messages before calling the LLM
- estimate token usage before generation where practical
- record actual token usage through a usage handler
- apply per-user and global model limits
- gate each tool with normal auth and ownership checks
- require explicit confirmation before paid generation or destructive actions
- cap tool-call iterations with `stopWhen` or equivalent
- never expose raw R2 keys or signed URLs to the model unless needed and scoped
- log tool calls and agent decisions without sending private prompt content to
  analytics

Suggested first support-agent limits:

| Surface | Suggested Limit | Reason |
| --- | --- | --- |
| Support assistant messages | 30/hour/user, burst 10; global 2,000/hour | Prevent chat spam and provider spend spikes |
| Support assistant tokens | 100k tokens/day/user; global provider bucket | Bound long conversations and large context windows |
| Support doc RAG searches | 120/hour/user, burst 30 | Each message may retrieve context |

If an agent can launch provider work, it must consume the existing surface
limits before tool execution, not after the model asks for the tool.

## Privacy And Data Boundaries

Agent threads can persist sensitive or commercially private information:

- product details
- audience details
- media names and descriptions
- generated scripts and hooks
- user questions about their marketing strategy
- support context

Rules:

- start with public-doc context only
- add private workspace tools only after a separate privacy review
- keep thread ownership scoped to Clerk/Convex owner ID
- avoid including raw media blobs in messages
- avoid writing private prompts or free-form user messages to PostHog
- expose admin/debug thread inspection only to authorized operators
- document retention and deletion behavior before launch

## Tool Design Rules

Follow conservative agent architecture:

- Give each agent a small tool set.
- Prefer read-only tools first.
- Return IDs and concise summaries, not entire records.
- Add max iteration limits.
- Treat tool errors as visible observations.
- Require explicit user approval before writes, provider calls, R2 URL
  creation, deletions, or paid generation.
- Keep deterministic business logic outside the model whenever possible.

Useful first tools for a support assistant:

- `searchPublicDocs`
- `getRateLimitHelpArticle`
- `getFeatureGuideSummary`

Useful later tools for a creative assistant:

- `searchOwnerMediaByMeaning`
- `getProductSummary`
- `getClipMetadataSummary`
- `draftOverlayText`
- `draftSwipeSlides`

Avoid first:

- `deleteObject`
- `createReplicatePrediction`
- `createR2SignedUrl`
- unrestricted `runGeneration`

## Agent Versus RAG And LLM Cache

These components solve different problems:

- RAG retrieves relevant content from a corpus.
- LLM cache avoids repeated provider calls for identical requests.
- Agent manages threaded conversations, tool calls, streaming, and message
  history.

For ClipStitchr, the likely adoption order is:

1. RAG for semantic background/media search.
2. LLM cache for repeatable product enrichment or text metadata generation.
3. Agent only when adding an actual assistant/chat/planner feature.

Installing Agent before RAG or cache would add infrastructure without a clear
near-term user workflow.

## Suggested Pilot

Recommended first implementation, when ready:

1. Build a support/docs assistant, not a generation agent.
2. Register the Agent component and required AI SDK dependencies.
3. Add public-doc RAG retrieval or a small static docs retrieval tool.
4. Persist one thread per user support conversation.
5. Add strict per-user and global token/message limits.
6. Add usage tracking through `usageHandler`.
7. Add tests for auth, rate-limit failures, tool boundaries, and no-private-data
   responses.
8. Update `docs/backend/rate-limits.md` and privacy documentation.

Success criteria:

- The assistant answers product-help questions from docs.
- It does not create, mutate, delete, or generate media.
- It keeps thread history useful across sessions.
- It surfaces when it cannot answer from docs.
- It records usage and respects rate limits.

## Decision

Yes, ClipStitchr can benefit from `@convex-dev/agent`, but adoption should be
deferred until there is a real conversational assistant or planner surface.

For the current MVP, the component would not materially improve the core
Stitchr, Swipr, Clipr, Swapr, upload, or media-rendering workflows. The app's
near-term backend work should focus on semantic retrieval, repeat-call caching,
rate limits, credit accounting, and durable provider/media finalization.
