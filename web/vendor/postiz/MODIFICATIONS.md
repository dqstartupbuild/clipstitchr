# Modifications to the Postiz source import

Upstream: `https://github.com/gitroomhq/postiz-app`  
Source commit: `cf4c432c00c9db775ea1b1f12480a8e2b89aec32`  
Local modification date: `2026-08-02`

The import keeps upstream paths where practical, but it is intentionally not a
verbatim application copy. ClipStitchr retains only Instagram, Instagram
Standalone, and TikTok publishing reference code. All modified files are also
identified by hash and summary in `provenance.json`.

## Modification categories

1. Provider pruning: removed every provider registration, implementation
   branch, icon branch, DTO union member, and provider-only endpoint outside the
   three allowed identifiers.
2. Product-surface pruning: removed AI/Copilot, generator/agent metadata,
   billing, marketplace, extension token storage, public connection invites,
   public/API code-output mode, creation-method badges, short-linking, and plug
   automation from the retained paths.
3. Authentication boundary: removed Postiz cookie assumptions from the retained
   callback page and left four explicit Clerk/tenant adapter imports unresolved.
4. ClipStitchr routing and shell: replaced Postiz chrome with a focused
   publishing shell and `/dashboard/publishing/*` navigation, including an
   Integrations destination.
5. Backend focus: removed unrelated service dependencies and narrowed the
   retained controller, repository, service, and Temporal reference slices.
6. Branding and copy: removed user-facing Postiz/Gitroom and unrelated-provider
   copy from the retained UI and errors.
7. Schema boundary: derived a small publishing schema reference fragment rather
   than copying the complete upstream application schema.
8. Dependency closure: copied two missing verbatim translation dependencies and
   removed `clsx` from the minimal navigation shell.

## Modified files

| Local path | Modification summary |
| --- | --- |
| `apps/backend/src/api/routes/integrations.controller.ts` | Removed subscription channel limits, plug automation, Telegram, and Moltbook endpoints; retained focused connection/account operations. |
| `apps/backend/src/api/routes/posts.controller.ts` | Removed short-link, generator, agent graph, OpenAI stream, and associated dependencies. |
| `apps/backend/src/api/routes/posts.validation.exception.ts` | Replaced unrelated provider examples with Instagram and TikTok examples. |
| `apps/frontend/src/app/(app)/(site)/analytics/page.tsx` | Removed Postiz/Gitroom metadata branching and uses neutral Publishing Analytics metadata. |
| `apps/frontend/src/app/(app)/(site)/launches/page.tsx` | Removed Postiz/Gitroom metadata branching and uses neutral Publishing Calendar metadata. |
| `apps/frontend/src/app/(app)/integrations/social/[provider]/page.tsx` | Removed the Postiz `auth` cookie lookup; the eventual ClipStitchr route wrapper owns Clerk authentication. |
| `apps/frontend/src/components/launches/add.provider.component.tsx` | Replaced the broad provider chooser with an allowlisted Instagram/TikTok connection surface; removed extension, Web3, custom-provider, and public invite behavior. |
| `apps/frontend/src/components/launches/calendar.tsx` | Removed X analytics handling, the YouTube icon branch, and API/MCP/automation creation-method badges; all retained accounts use copied provider PNG assets. |
| `apps/frontend/src/components/launches/continue.integration.tsx` | Removed MeWe, X, VK, extension-token behavior, and unrelated display names; restricted providers and redirected into `/dashboard/publishing/integrations`. |
| `apps/frontend/src/components/launches/general.preview.component.tsx` | Replaced the X-specific profile-image alternative text with neutral publishing copy. |
| `apps/frontend/src/components/launches/helpers/pick.platform.component.tsx` | Removed the YouTube SVG special case. |
| `apps/frontend/src/components/launches/launches.component.tsx` | Derived a focused calendar/list shell and filtered integration data to the three allowed providers. |
| `apps/frontend/src/components/layout/top.menu.tsx` | Replaced Postiz navigation with Calendar, Posts, Analytics, and Integrations under a configurable publishing base path. |
| `apps/frontend/src/components/layout/user.context.tsx` | Replaced Postiz organization/billing user state with a small publishing user context seam for a Clerk-backed adapter. |
| `apps/frontend/src/components/media/media.component.tsx` | Derived a focused media-library selector and removed AI, design-tool, third-party generation, and API-output-only state. |
| `apps/frontend/src/components/new-launch/add.edit.modal.tsx` | Removed the Postiz support/Copilot-specific style override and public API code-output mode. |
| `apps/frontend/src/components/new-launch/editor.tsx` | Removed Copilot actions/readables, the Telegram-only toolbar branch, and public API code-output state. |
| `apps/frontend/src/components/new-launch/finisher/thread.finisher.tsx` | Removed the public API code-output state passed into the retained thread-finisher editor. |
| `apps/frontend/src/components/new-launch/manage.modal.tsx` | Removed Copilot popup, short-link behavior, creation-method branching, and public API code-output modal behavior; schedules retain original URLs. |
| `apps/frontend/src/components/new-launch/picks.socials.component.tsx` | Removed the YouTube SVG special case. |
| `apps/frontend/src/components/new-launch/providers/continue-provider/list.tsx` | Reduced continuation components to Instagram's required account/page selection. |
| `apps/frontend/src/components/new-launch/providers/high.order.provider.tsx` | Removed internal plug loading and plug-channel settings UI. |
| `apps/frontend/src/components/new-launch/providers/instagram/instagram.preview.tsx` | Removed the YouTube placeholder asset and LinkedIn color token from Instagram preview fallback styling. |
| `apps/frontend/src/components/new-launch/providers/show.all.providers.tsx` | Reduced the provider UI registry to Instagram, Instagram Standalone, and TikTok. |
| `apps/frontend/src/components/new-launch/providers/tiktok/tiktok.provider.tsx` | Removed branded `#Postiz` fallback copy and clarified TikTok upload-only behavior in plain language. |
| `apps/frontend/src/components/new-launch/select.current.tsx` | Removed the YouTube SVG special case. |
| `apps/frontend/src/components/new-launch/store.ts` | Removed composer state used only by the excluded public API code-output mode. |
| `apps/frontend/src/components/new-layout/layout.component.tsx` | Replaced Postiz account, billing, assistant, support, extension, notification, telemetry, and brand chrome with a focused shell using ClipStitchr CSS variables and a relative shell import. |
| `apps/frontend/src/components/new-layout/menu-item.tsx` | Removed `clsx` and upstream custom utilities; joins class segments locally and uses ClipStitchr CSS variables so the shell adds no package or theme dependency. |
| `apps/frontend/src/components/platform-analytics/platform.analytics.tsx` | Allowlisted retained providers, removed X logic and marketplace artwork, and routes empty state to publishing integrations. |
| `apps/frontend/src/components/settings/signatures.component.tsx` | Replaced Copilot textarea with a normal textarea. |
| `apps/orchestrator/src/activities/post.activity.ts` | Pruned billing, notification, webhook, plug, and streak activities; retained core post/comment, state, recovery, and refresh activities. |
| `apps/orchestrator/src/workflows/index.ts` | Exports only the retained v1.0.5 post workflow and refresh workflow. |
| `apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.0.5.ts` | Pruned notification, webhook, plug, and repeat-child behavior while preserving the core reference publish/retry sequence. |
| `libraries/helpers/src/utils/count.length.ts` | Removed X/Twitter weighted-length parsing and its `twitter-text` dependency; retained plain provider character slicing. |
| `libraries/nestjs-libraries/src/database/prisma/integrations/integration.repository.ts` | Removed plug repositories and plug CRUD while retaining integration and provider-function existing-data access. |
| `libraries/nestjs-libraries/src/database/prisma/integrations/integration.service.ts` | Removed billing, autopost, notification, Temporal scheduling, and plug behavior; retained connection, refresh, analytics, and account operations. |
| `libraries/nestjs-libraries/src/database/prisma/media/media.service.ts` | Derived a read-only media lookup seam; upload, deletion, AI, and video-generation behavior is excluded. |
| `libraries/nestjs-libraries/src/database/prisma/posts/posts.service.ts` | Removed OpenAI generation, short-linking, X weighting, and plug automation while retaining focused post/media/scheduling reference behavior. |
| `libraries/nestjs-libraries/src/database/prisma/schema.publishing.prisma` | Derived a self-contained publishing entity fragment from upstream `schema.prisma`; explicitly not a deployable ClipStitchr schema. |
| `libraries/nestjs-libraries/src/dtos/posts/providers-settings/all.providers.settings.ts` | Reduced the provider settings union and validator list to Instagram and TikTok settings. |
| `libraries/nestjs-libraries/src/dtos/webhooks/ssrf.safe.dispatcher.ts` | Reworded an unrelated-provider comment as a generic private-network webhook exception. |
| `libraries/nestjs-libraries/src/integrations/integration.manager.ts` | Registry now instantiates only the three allowed providers; removed AI tool/rules metadata and plug registries. |
| `libraries/nestjs-libraries/src/integrations/social/instagram.provider.ts` | Removed AI rules/tool decorators while retaining Instagram validation, OAuth, publishing, analytics, comments, and audio lookup. |
| `libraries/nestjs-libraries/src/integrations/social/instagram.standalone.provider.ts` | Removed AI rules metadata while retaining standalone Instagram behavior. |
| `libraries/nestjs-libraries/src/integrations/social/tiktok.provider.ts` | Removed AI rules metadata, neutralized branded upload errors, and corrected the visible TikTok name. |
| `libraries/nestjs-libraries/src/integrations/social.abstract.ts` | Replaced an X-specific media-path example with a neutral clip example. |
| `libraries/nestjs-libraries/src/temporal/temporal.module.ts` | Replaced unrelated provider queue examples with Instagram/TikTok examples. |
| `libraries/react-shared-libraries/src/helpers/variable.context.tsx` | Narrowed configuration state to the five values used by the retained fetch/media closure. |

Files marked `verbatim` in `provenance.json`, including `LICENSE`, the retained
provider icons, translation dependencies, `colors.scss`, and
`tailwind.config.cjs`, are byte-identical to the pinned upstream commit.
