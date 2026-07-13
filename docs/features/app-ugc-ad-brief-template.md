# App UGC Ad Brief Template

## Purpose

The App UGC Ad Brief Template is an immediately usable guided resource at
`/tools/app-ugc-ad-brief-template`. It gives app founders and marketers a blank
brief plus one complete fictional example without replacing the existing
personalized UGC Brief Builder.

## How It Works

The definition contains nineteen checkable items across strategy, capture and
delivery, and a filled TempoList example. Eleven blank-template items include
notes for project context, audience, approved claims, forbidden claims,
deliverables, reusable takes, demo handoff, naming, usage questions, and the
reshoot process. Notes are browser-session state and appear in copied or
downloaded Markdown.

The example is explicitly fictional. It demonstrates the expected detail while
warning visitors to replace every product fact and claim with confirmed
information.

## Use Cases

- Prepare a first creator brief before outreach.
- Separate approved product facts from do-not-say claims.
- Request individual reusable takes and a clean app demo.
- Give a creator concrete filenames, folders, review timing, and reshoot rules.

## Paid Boundary and Privacy

The resource does not personalize the brief, manage creators, accept footage,
verify rights, store the result, or produce an ad. It does not provide legal
advice. The full template is available before optional mailing-list capture,
and the lead form does not receive brief notes.

## Relevant Files

- `web/lib/clipstitchr/tools/appUgcAdBriefTemplate/appUgcAdBriefTemplateDefinition.ts`
- `web/lib/clipstitchr/tools/appUgcAdBriefTemplate/appUgcAdBriefTemplateDefinition.test.ts`
- `web/app/(content)/tools/app-ugc-ad-brief-template/page.tsx`
- `web/app/_components/tools/resources/AppUgcAdBriefTemplatePage.test.tsx`

The page uses the shared `GuidedResourcePage` and
`createGuidedResourceMarkdown` primitives. Portfolio scope and product
boundaries come from `docs/features/public-tool-batch-16-50-design.md`; ongoing
release evidence is recorded in `docs/features/public-tool-quality-register.md`.

## Verification

Definition tests assert nineteen unique items, eleven editable template fields,
the complete example, and Markdown note output. The page test covers the route
promise, download control, exact lead source, canonical metadata, tools link,
and paid pricing path.
